import { Pool } from "pg";

let pool;

function getConnectionString() {
  return process.env.DATABASE_URL || "";
}

export function isDatabaseReady() {
  return Boolean(getConnectionString());
}

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getConnectionString(),
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

export async function dbQuery(text, params = []) {
  if (!isDatabaseReady()) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return getPool().query(text, params);
}

export async function withTransaction(fn) {
  if (!isDatabaseReady()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
