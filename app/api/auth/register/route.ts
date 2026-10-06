import { createHash } from "node:crypto";
import { getSqlPool, sql } from "../../../../lib/azure-sql";
import { hashPassword } from "../../../../lib/passwords";
import { sessionCookie, sessionToken } from "../../../../lib/beta-auth";

const json = (body: unknown, status=200, headers: HeadersInit={}) => Response.json(body, { status, headers: { ...headers, "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const displayName = String(body.displayName ?? email.split("@")[0]).trim().slice(0, 120);
    const inviteCode = String(body.inviteCode ?? "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 10 || !inviteCode || !displayName) return json({ error: "Datos de registro inválidos." }, 400);
    const pool = await getSqlPool();
    const tx = new sql.Transaction(pool); await tx.begin();
    try {
      const invite = await new sql.Request(tx).input("hash", sql.VarBinary(32), createHash("sha256").update(inviteCode).digest()).query("SELECT TOP 1 id FROM dbo.beta_invite_codes WHERE code_hash=@hash AND uses<max_uses AND (expires_at IS NULL OR expires_at>SYSUTCDATETIME())");
      if (!invite.recordset[0]) { await tx.rollback(); return json({ error: "Código de habilitación inválido o vencido." }, 403); }
      const hash = await hashPassword(password);
      const user = await new sql.Request(tx).input("email", sql.NVarChar(320), email).input("name", sql.NVarChar(120), displayName).input("password", sql.NVarChar(300), hash).query("INSERT INTO dbo.beta_users(email,display_name,password_hash) OUTPUT INSERTED.id,INSERTED.email,INSERTED.display_name VALUES(@email,@name,@password)");
      await new sql.Request(tx).input("id", sql.UniqueIdentifier, invite.recordset[0].id).query("UPDATE dbo.beta_invite_codes SET uses=uses+1 WHERE id=@id");
      const token = sessionToken(); await new sql.Request(tx).input("token", sql.VarChar(128), token).input("user", sql.UniqueIdentifier, user.recordset[0].id).query("INSERT INTO dbo.beta_sessions(token,user_id,expires_at) VALUES(@token,@user,DATEADD(day,30,SYSUTCDATETIME()))");
      await tx.commit(); return json({ user: user.recordset[0] }, 201, { "Set-Cookie": sessionCookie(token) });
    } catch (error) { await tx.rollback(); if ((error as { number?: number }).number === 2627) return json({ error: "Ese correo ya está registrado." }, 409); throw error; }
  } catch (error) { console.error("Registration failed", error); return json({ error: "No se pudo completar el registro." }, 503); }
}
