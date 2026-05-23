import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT || "";
const key = process.env.COSMOS_KEY || "";
export const databaseName = process.env.COSMOS_DATABASE || "SankuCRM";

let cosmosClient: CosmosClient | null = null;
export function getCosmosClient(context: InvocationContext): CosmosClient | null {
    if (!endpoint || !key) {
        context.error("Cosmos DB configuration is missing. Ensure COSMOS_ENDPOINT and COSMOS_KEY are set.");
        return null;
    }
    if (!cosmosClient) {
        try {
            cosmosClient = new CosmosClient({ endpoint, key });
            context.log("Cosmos DB client initialized successfully.");
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            context.error(`Failed to initialize Cosmos DB client: ${message}`);
            return null;
        }
    }
    return cosmosClient;
}

export async function entities(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const client = getCosmosClient(context);
    if (!client) {
        return {
            status: 503,
            jsonBody: {
                error: "Cosmos DB is not configured correctly. Check Function App settings.",
            },
        };
    }

    const entityName = request.params.entityName;
    if (!entityName) {
        return { status: 400, body: "Entity name is required" };
    }

    const database = client.database(databaseName);
    const container = database.container(entityName);

    try {
        context.log(`Processing ${request.method} request for entity: ${entityName}`);
        if (request.method === "GET") {
            const id = request.params.id;
            if (id) {
                context.log(`Fetching item with id: ${id}`);
                const { resource } = await container.item(id, id).read();
                return { status: resource ? 200 : 404, jsonBody: resource };
            }
            context.log(`Fetching all items for ${entityName}`);
            const { resources } = await container.items.readAll().fetchAll();
            return { jsonBody: resources };
        }

        if (request.method === "POST" || request.method === "PATCH") {
            const body = (await request.json()) as Record<string, unknown>;
            context.log(`${request.method} body:`, JSON.stringify(body));
            if (request.method === "POST" && !body.id) {
                body.id = crypto.randomUUID();
            }
            const { resource } = await container.items.upsert(body);
            return { status: 201, jsonBody: resource };
        }

        if (request.method === "DELETE") {
            const id = request.params.id;
            if (!id) return { status: 400, jsonBody: { error: "ID required" } };
            context.log(`Deleting item with id: ${id}`);
            await container.item(id, id).delete();
            return { status: 204 };
        }

        return { status: 405, jsonBody: { error: "Method Not Allowed" } };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : "";
        context.error(`Error processing ${entityName}: ${message}`, stack);
        return { 
            status: 500, 
            jsonBody: { 
                error: message,
                entity: entityName,
                method: request.method
            } 
        };
    }
}

app.http('entities', {
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    route: 'entities/{entityName}/{id?}',
    authLevel: 'anonymous',
    handler: entities
});
