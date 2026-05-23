import { CosmosClient } from "@azure/cosmos";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseLocalSettings(): Record<string, string> {
  const filePath = join(__dirname, "..", "server", "local.settings.json");
  if (!existsSync(filePath)) return {};
  try {
    const content = JSON.parse(readFileSync(filePath, "utf8"));
    return content.Values || {};
  } catch {
    return {};
  }
}

async function main() {
  const settings = parseLocalSettings();
  
  const endpoint = process.env.COSMOS_ENDPOINT || settings.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY || settings.COSMOS_KEY;
  const databaseName = process.env.COSMOS_DATABASE || settings.COSMOS_DATABASE || "SankuCRM";

  if (!endpoint || !key) {
    console.error("Error: COSMOS_ENDPOINT and COSMOS_KEY must be set in server/local.settings.json or as environment variables.");
    process.exit(1);
  }

  console.log(`Connecting to Cosmos DB: ${endpoint}`);
  const client = new CosmosClient({ endpoint, key });

  console.log(`Creating database: ${databaseName}`);
  const { database } = await client.databases.createIfNotExists({ id: databaseName });

  const containers = ["Policies", "Stakeholders", "Projects", "Engagements", "Partners", "KPIs", "Meetings", "Processes"];
  
  for (const containerId of containers) {
    console.log(`Creating container: ${containerId} (Partition Key: /id)`);
    await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: { paths: ["/id"] }
    });
  }

  console.log("Database and containers set up successfully.");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
