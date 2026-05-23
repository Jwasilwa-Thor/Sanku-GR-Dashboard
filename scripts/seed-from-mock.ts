/**
 * Upserts mock CRM documents into Cosmos via the Azure Functions HTTP API.
 * Order respects foreign keys: Policies → Stakeholders → Projects → Engagements.
 *
 * Usage (from repo root):
 *   npm run seed
 *   SEED_API_BASE_URL=https://Sanku-GR.azurewebsites.net/api npm run seed
 *
 * Requires Functions running locally or deployed, with COSMOS_* configured and containers present.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  mockStakeholders,
  mockEngagements,
  mockProjects,
  mockPolicies,
  mockPartners,
  mockKPIs,
  mockMeetings,
  mockProcesses,
} from "../src/data/mock.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseDotEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function resolveApiBase(): string {
  const fromEnv =
    process.env.SEED_API_BASE_URL?.trim() ||
    process.env.VITE_AZURE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const prodFile = join(__dirname, "..", ".env.production");
  const fromFile = parseDotEnvFile(prodFile).VITE_AZURE_API_BASE_URL?.trim();
  if (fromFile) return fromFile.replace(/\/$/, "");

  return "http://localhost:7071/api";
}

async function upsertEntity(
  base: string,
  container: string,
  body: Record<string, unknown>
): Promise<void> {
  const id = String(body.id ?? "?");
  const url = `${base}/entities/${container}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    const hint =
      res.status === 503
        ? " (API returned 503: set COSMOS_ENDPOINT and COSMOS_KEY on the Function App.)"
        : res.status === 500
          ? " (500 often means missing Cosmos container, wrong partition key /id, or Cosmos config error.)"
          : "";
    throw new Error(`${container} id=${id}: ${res.status}${hint} ${text.slice(0, 500)}`);
  }
}

async function main(): Promise<void> {
  const base = resolveApiBase();
  console.log(`Seeding against API base: ${base}`);

  for (const doc of mockPolicies) {
    await upsertEntity(base, "Policies", doc as unknown as Record<string, unknown>);
    console.log(`  Policies / ${doc.id}`);
  }
  for (const doc of mockStakeholders) {
    await upsertEntity(base, "Stakeholders", doc as unknown as Record<string, unknown>);
    console.log(`  Stakeholders / ${doc.id}`);
  }
  for (const doc of mockProjects) {
    await upsertEntity(base, "Projects", doc as unknown as Record<string, unknown>);
    console.log(`  Projects / ${doc.id}`);
  }
  for (const doc of mockEngagements) {
    await upsertEntity(base, "Engagements", doc as unknown as Record<string, unknown>);
    console.log(`  Engagements / ${doc.id}`);
  }
  for (const doc of mockPartners) {
    await upsertEntity(base, "Partners", doc as unknown as Record<string, unknown>);
    console.log(`  Partners / ${doc.id}`);
  }
  for (const doc of mockKPIs) {
    await upsertEntity(base, "KPIs", doc as unknown as Record<string, unknown>);
    console.log(`  KPIs / ${doc.id}`);
  }
  for (const doc of mockMeetings) {
    await upsertEntity(base, "Meetings", doc as unknown as Record<string, unknown>);
    console.log(`  Meetings / ${doc.id}`);
  }
  for (const doc of mockProcesses) {
    await upsertEntity(base, "Processes", doc as unknown as Record<string, unknown>);
    console.log(`  Processes / ${doc.id}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
