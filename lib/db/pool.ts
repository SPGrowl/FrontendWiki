import { Pool, type QueryResult, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __wikiPgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL 未配置。请复制 env.example 为 .env.local 并设置连接串。"
    );
  }

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

/** 获取连接池（开发环境复用，避免热更新泄漏连接） */
export function getPool(): Pool {
  if (process.env.NODE_ENV === "production") {
    return createPool();
  }

  if (!global.__wikiPgPool) {
    global.__wikiPgPool = createPool();
  }

  return global.__wikiPgPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}

/** 用于启动检查或 db:check 脚本 */
export async function testConnection(): Promise<boolean> {
  try {
    await query("SELECT 1 AS ok");
    return true;
  } catch {
    return false;
  }
}

export async function closePool(): Promise<void> {
  const pool = global.__wikiPgPool;
  if (pool) {
    await pool.end();
    global.__wikiPgPool = undefined;
  }
}
