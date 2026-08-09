import pg from "pg";
import { getDatabaseUrl, loadEnvLocal } from "./db-env.mjs";

loadEnvLocal();

async function main() {
  const connectionString = getDatabaseUrl();
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    const ping = await client.query("SELECT 1 AS ok");
    console.log("Connection OK:", ping.rows[0]);

    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log(
      "Tables:",
      tables.rows.map((row) => row.table_name).join(", ") || "(none)"
    );

    const counts = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users) AS users,
        (SELECT COUNT(*)::int FROM entries) AS entries,
        (SELECT COUNT(*)::int FROM entry_versions) AS entry_versions
    `);
    console.log("Row counts:", counts.rows[0]);
  } catch (error) {
    console.error("db:check failed:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
