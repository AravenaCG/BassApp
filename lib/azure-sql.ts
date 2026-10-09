import sql from "mssql";
import { connectBetaPool } from "./beta-sql-guard.mjs";

let poolPromise: Promise<sql.ConnectionPool> | undefined;

function connectionString() {
  const value = process.env.AZURE_SQL_CONNECTION_STRING;
  if (!value) throw new Error("AZURE_SQL_CONNECTION_STRING is not configured");
  return value;
}

export function getSqlPool() {
  poolPromise ??= connectBetaPool(connectionString(),sql.ConnectionPool).catch((error:unknown) => {
    poolPromise = undefined;
    throw error;
  });
  return poolPromise;
}

export { sql };
