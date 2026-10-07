import sql from "mssql";

let poolPromise: Promise<sql.ConnectionPool> | undefined;

function connectionString() {
  const value = process.env.AZURE_SQL_CONNECTION_STRING;
  if (!value) throw new Error("AZURE_SQL_CONNECTION_STRING is not configured");
  return value;
}

export function getSqlPool() {
  poolPromise ??= new sql.ConnectionPool(connectionString()).connect().catch(error => {
    poolPromise = undefined;
    throw error;
  });
  return poolPromise;
}

export { sql };
