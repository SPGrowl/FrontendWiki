import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { getDatabaseUrl, loadEnvLocal } from "./db-env.mjs";
import { hashPassword } from "./hash-password.mjs";

loadEnvLocal();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function adminConnectionString() {
  const url = getDatabaseUrl();
  return url.replace(/\/[^/]*(\?.*)?$/, "/postgres$1");
}

async function ensureDatabase(adminUrl) {
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();

  const exists = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    ["frontend_wiki"]
  );

  if (exists.rowCount === 0) {
    await client.query("CREATE DATABASE frontend_wiki");
    console.log("Created database: frontend_wiki");
  } else {
    console.log("Database frontend_wiki already exists");
  }

  await client.end();
}

async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  console.log(`Running ${path.relative(root, filePath)}...`);
  await client.query(sql);
}

async function main() {
  const adminUrl = adminConnectionString();
  const dbUrl = getDatabaseUrl();

  console.log("Ensuring database exists...");
  await ensureDatabase(adminUrl);

  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();

  try {
    await runSqlFile(client, path.join(root, "db", "init.sql"));

    const seedPath = path.join(root, "db", "seed.sql");
    if (fs.existsSync(seedPath)) {
      await runSqlFile(client, seedPath);
    }

    await client.query(
      `UPDATE users
       SET password = $1
       WHERE id = $2 AND password = ''`,
      [
        hashPassword("admin"),
        "00000000-0000-0000-0000-000000000001",
      ]
    );

    console.log("Database initialization complete.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("db:init failed:", error.message);
  process.exit(1);
});
