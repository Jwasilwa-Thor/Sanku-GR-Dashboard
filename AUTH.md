# Sanku CRM Authentication System

This document provides details on the implementation, configuration, and maintenance of the authentication system.

## 1. Core Features
- **Email/Password Authentication**: Secure registration and login with strong password enforcement.
- **Social Login**: Integrated support for Google and Microsoft via OAuth 2.0.
- **Session Management**: Secure HttpOnly, SameSite cookies with JWT for session persistence.
- **Password Recovery**: Secure reset flow using time-limited tokens.
- **Email Verification**: Verification flow to ensure account ownership.
- **Super Admin**: `jimson.wasilwa@gmail.com` is automatically assigned the `super_admin` role upon registration.

## 2. Security Measures
- **Password Hashing**: Salted `bcrypt` hashing with a cost factor of 12.
- **Rate Limiting**: Protection against brute-force attacks on login and registration endpoints.
- **CSRF Protection**: HttpOnly cookies with `SameSite: Strict` and origin validation.
- **Input Validation**: Robust server-side validation using `validator.js`.
- **Encryption**: All data in transit must be served over HTTPS (enforced by Azure environment).

## 3. Social Login Configuration

To enable social logins in production, follow these steps:

### Google Integration
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Configure the OAuth Consent Screen.
4. Go to "Credentials" -> "Create Credentials" -> "OAuth client ID".
5. Select "Web application".
6. Add `https://your-domain.com` to Authorized JavaScript origins.
7. Add `https://your-domain.com/api/auth/social-login` to Authorized redirect URIs.
8. Store the Client ID and Secret in Azure Function App Settings as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Microsoft Integration
1. Go to the [Azure Portal](https://portal.azure.com/).
2. Search for and select "App registrations".
3. Select "New registration".
4. Configure the name and supported account types.
5. Add `https://your-domain.com/api/auth/social-login` to Redirect URIs (Web).
6. Under "Certificates & secrets", create a new client secret.
7. Store the Application (client) ID and Secret in Azure Function App Settings as `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET`.

## 4. Local Development
1. Run `npm install` in both the root and `server` directories.
2. Ensure you have the [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local) installed.
3. Run `npm run setup-db` to create the `Users` container in your Cosmos DB instance.
4. Set `JWT_SECRET` in your `local.settings.json`.

## 5. Maintenance
- **Token Expiry**: JWT tokens expire after 7 days by default.
- **Audit Logs**: Authentication attempts are logged to the Azure Function Invocation Context.
- **Database**: Users are stored in the `Users` container. Avoid direct manual edits to password hashes.
