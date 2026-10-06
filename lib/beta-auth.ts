import { randomBytes } from "node:crypto";
import { getSqlPool, sql } from "./azure-sql";

export async function currentBetaUser(request: Request) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)appbass_session=([^;]+)/)?.[1];
  if (!token) return null;
  const pool = await getSqlPool();
  const result = await pool.request().input("token", sql.VarChar(128), token)
    .query("SELECT TOP 1 u.id, u.email, u.display_name FROM dbo.beta_sessions s JOIN dbo.beta_users u ON u.id=s.user_id WHERE s.token=@token AND s.expires_at>SYSUTCDATETIME() AND u.is_active=1");
  return result.recordset[0] ?? null;
}

export function sessionToken() { return randomBytes(48).toString("base64url"); }

export function sessionCookie(token: string) {
  return `appbass_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;
}
