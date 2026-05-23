import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Container } from "@azure/cosmos";
import validator from "validator";
import { getCosmosClient, databaseName } from "./entities";
import { User, hashPassword, comparePassword, generateToken, verifyToken } from "./utils/auth";
import * as cookie from "cookie";

const USERS_CONTAINER = "Users";
const SUPER_ADMIN_EMAIL = "jimson.wasilwa@gmail.com";

// Simple in-memory rate limiter (Note: won't persist across function restarts or multiple instances)
const rateLimitMap = new Map<string, { count: number; lastRequest: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record) {
        rateLimitMap.set(ip, { count: 1, lastRequest: now });
        return true;
    }

    if (now - record.lastRequest > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, lastRequest: now });
        return true;
    }

    if (record.count >= MAX_ATTEMPTS) {
        return false;
    }

    record.count++;
    record.lastRequest = now;
    return true;
}

export async function authHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const client = getCosmosClient(context);
    if (!client) {
        return { status: 503, jsonBody: { error: "Database not available" } };
    }

    // Basic CSRF protection: check for custom header in POST requests
    if (request.method === "POST") {
        // const origin = request.headers.get("origin");
        // In production, validate origin against allowed list
    }

    const action = request.params.action;
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    if (["login", "register", "forgot-password"].includes(action)) {
        if (!checkRateLimit(ip)) {
            return { 
                status: 429, 
                jsonBody: { error: "Too many attempts. Please try again later." } 
            };
        }
    }

    const database = client.database(databaseName);
    const container = database.container(USERS_CONTAINER);

    try {
        switch (action) {
            case "register":
                return await handleRegister(request, container, context);
            case "login":
                return await handleLogin(request, container);
            case "social-login":
                return await handleSocialLogin(request, container);
            case "me":
                return await handleMe(request, container);
            case "logout":
                return handleLogout();
            case "verify-email":
                return await handleVerifyEmail(request, container);
            case "forgot-password":
                return await handleForgotPassword(request, container, context);
            case "reset-password":
                return await handleResetPassword(request, container);
            default: 
                return { status: 404, body: "Auth action not found" };
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        context.error(`Auth Error (${action}): ${message}`);
        return { status: 500, jsonBody: { error: message } };
    }
}

async function handleRegister(request: HttpRequest, container: Container, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = (await request.json()) as Record<string, string>;
        const { email, password, name } = body;

        if (!email || !password || !name) {
            return { status: 400, jsonBody: { error: "Missing required fields" } };
        }

        if (!validator.isEmail(email)) {
            return { status: 400, jsonBody: { error: "Invalid email address" } };
        }

        if (!validator.isLength(password, { min: 8 })) {
            return { status: 400, jsonBody: { error: "Password must be at least 8 characters long" } };
        }

        // Check if user exists
        const { resources: existingUsers } = await container.items
            .query({
                query: "SELECT * FROM c WHERE c.email = @email",
                parameters: [{ name: "@email", value: email.toLowerCase() }]
            })
            .fetchAll();

        if (existingUsers.length > 0) {
            return { status: 409, jsonBody: { error: "User already exists" } };
        }

        const hashedPassword = await hashPassword(password);
        const role = email.toLowerCase() === SUPER_ADMIN_EMAIL ? "super_admin" : "user";

        const newUser: User = {
            id: Math.random().toString(36).substring(2, 11),
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            role,
            isVerified: false,
            verificationToken: Math.random().toString(36).substring(2, 15),
            provider: "local",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await container.items.create(newUser);

        // In a real app, send verification email here.
        context.log(`User registered: ${email}. Verification token: ${newUser.verificationToken}`);

        return { 
            status: 201, 
            jsonBody: { message: "User registered successfully. Please verify your email." } 
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        context.error(`Registration Error: ${message}`);
        return { status: 500, jsonBody: { error: "Failed to register user. Please check server logs." } };
    }
}

async function handleLogin(request: HttpRequest, container: Container): Promise<HttpResponseInit> {
    const body = (await request.json()) as { email?: string; password?: string; rememberMe?: boolean };
    const { email, password, rememberMe } = body;

    if (!email || !password) {
        return { status: 400, jsonBody: { error: "Missing email or password" } };
    }

    const { resources: users } = await container.items
        .query({
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email.toLowerCase() }]
        })
        .fetchAll();

    const user = users[0] as User;
    if (!user || !user.password) {
        return { status: 401, jsonBody: { error: "Invalid credentials" } };
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return { status: 401, jsonBody: { error: "Invalid credentials" } };
    }

    const token = generateToken(user);
    const cookieOptions = {
        httpOnly: true,
        secure: true, // Should be true in production (HTTPS)
        sameSite: "strict" as const,
        maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7, // 30 days or 7 days
        path: "/"
    };

    const authCookie = cookie.serialize("auth_token", token, cookieOptions);

    return {
        status: 200,
        headers: {
            "Set-Cookie": authCookie
        },
        jsonBody: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        }
    };
}

async function handleSocialLogin(request: HttpRequest, container: Container): Promise<HttpResponseInit> {
    const { provider, providerId, email, name } = (await request.json()) as Record<string, string>;

    if (!provider || !providerId || !email) {
        return { status: 400, jsonBody: { error: "Missing social login data" } };
    }

    if (!["google", "microsoft"].includes(provider)) {
        return { status: 400, jsonBody: { error: "Social provider not supported" } };
    }

    // Check if user exists by provider and providerId
    const { resources: users } = await container.items
        .query({
            query: "SELECT * FROM c WHERE c.provider = @provider AND c.providerId = @providerId",
            parameters: [
                { name: "@provider", value: provider },
                { name: "@providerId", value: providerId }
            ]
        })
        .fetchAll();

    let user = users[0] as User;

    if (!user) {
        // Check if user exists by email to merge
        const { resources: usersByEmail } = await container.items
            .query({
                query: "SELECT * FROM c WHERE c.email = @email",
                parameters: [{ name: "@email", value: email.toLowerCase() }]
            })
            .fetchAll();

        if (usersByEmail.length > 0) {
            user = usersByEmail[0] as User;
            user.provider = provider as User['provider'];
            user.providerId = providerId;
            user.updatedAt = new Date().toISOString();
            await container.items.upsert(user);
        } else {
            // Create new user
            const role = email.toLowerCase() === SUPER_ADMIN_EMAIL ? "super_admin" : "user";
            user = {
                id: Math.random().toString(36).substring(2, 11),
                email: email.toLowerCase(),
                name,
                role,
                isVerified: true, // Social login users are usually verified
                provider: provider as User['provider'],
                providerId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await container.items.create(user);
        }
    }

    const token = generateToken(user);
    const authCookie = cookie.serialize("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
    });

    return {
        status: 200,
        headers: { "Set-Cookie": authCookie },
        jsonBody: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        }
    };
}

async function handleMe(request: HttpRequest, container: Container): Promise<HttpResponseInit> {
    const cookies = cookie.parse(request.headers.get("cookie") || "");
    const token = cookies["auth_token"];

    if (!token) {
        return { status: 401, jsonBody: { error: "Not authenticated" } };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return { status: 401, jsonBody: { error: "Invalid token" } };
    }

    const { resource: user } = await container.item(decoded.id as string, decoded.id as string).read();
    if (!user) {
        return { status: 401, jsonBody: { error: "User not found" } };
    }

    return {
        status: 200,
        jsonBody: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        }
    };
}

function handleLogout(): HttpResponseInit {
    const authCookie = cookie.serialize("auth_token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        expires: new Date(0),
        path: "/"
    });

    return {
        status: 200,
        headers: { "Set-Cookie": authCookie },
        jsonBody: { message: "Logged out successfully" }
    };
}

async function handleVerifyEmail(request: HttpRequest, container: Container): Promise<HttpResponseInit> {
    const token = request.query.get("token");
    if (!token) return { status: 400, jsonBody: { error: "Token required" } };

    const { resources: users } = await container.items
        .query({
            query: "SELECT * FROM c WHERE c.verificationToken = @token",
            parameters: [{ name: "@token", value: token }]
        })
        .fetchAll();

    const user = users[0] as User;
    if (!user) return { status: 400, jsonBody: { error: "Invalid or expired token" } };

    user.isVerified = true;
    user.verificationToken = undefined;
    user.updatedAt = new Date().toISOString();
    await container.items.upsert(user);

    return { status: 200, jsonBody: { message: "Email verified successfully" } };
}

async function handleForgotPassword(request: HttpRequest, container: Container, context: InvocationContext): Promise<HttpResponseInit> {
    const body = await request.json() as Record<string, string>;
    const email = body?.email;
    if (!email) return { status: 400, jsonBody: { error: "Email required" } };

    const { resources: users } = await container.items
        .query({
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email.toLowerCase() }]
        })
        .fetchAll();

    const user = users[0] as User;
    if (!user) {
        // Don't reveal if user exists for security
        return { status: 200, jsonBody: { message: "If an account exists, a reset email has been sent." } };
    }

    const resetToken = Math.random().toString(36).substring(2, 15);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await container.items.upsert(user);

    context.log(`Password reset for ${email}. Token: ${resetToken}`);

    return { status: 200, jsonBody: { message: "If an account exists, a reset email has been sent." } };
}

async function handleResetPassword(request: HttpRequest, container: Container): Promise<HttpResponseInit> {
    const { token, password } = (await request.json()) as Record<string, string>;
    if (!token || !password) return { status: 400, jsonBody: { error: "Token and password required" } };

    const { resources: users } = await container.items
        .query({
            query: "SELECT * FROM c WHERE c.resetPasswordToken = @token",
            parameters: [{ name: "@token", value: token }]
        })
        .fetchAll();

    const user = users[0] as User;
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
        return { status: 400, jsonBody: { error: "Invalid or expired token" } };
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updatedAt = new Date().toISOString();
    await container.items.upsert(user);

    return { status: 200, jsonBody: { message: "Password reset successfully" } };
}

app.http('auth', {
    methods: ['GET', 'POST'],
    route: 'auth/{action}',
    authLevel: 'anonymous',
    handler: authHandler
});
