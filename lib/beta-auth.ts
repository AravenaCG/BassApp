import { randomBytes } from "node:crypto";
import { getSqlPool, sql } from "./azure-sql";
import { HttpError } from "./http";

export async function currentBetaUser(request: Request) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)appbass_session=([^;]+)/)?.[1];
  if (!token) return null;
  const pool = await getSqlPool();
  const result = await pool.request().input("token", sql.VarChar(128), token)
    .query("SELECT TOP 1 u.id,u.email,u.display_name,u.weekly_study_minutes,u.reminder_day,u.instrument,u.study_level,u.time_zone,u.reminder_enabled,u.reminder_snoozed_until,u.last_reminder_at,u.last_lesson,u.created_at FROM dbo.beta_sessions s JOIN dbo.beta_users u ON u.id=s.user_id WHERE s.token=@token AND s.expires_at>SYSUTCDATETIME() AND u.is_active=1");
  return result.recordset[0] ?? null;
}

export async function requireBetaUser(request: Request) {
  const user = await currentBetaUser(request);
  if (!user) throw new HttpError(401, 'Iniciá sesión para guardar tu actividad.');
  return user;
}

export function publicUser(user: Record<string, any>) {
  return {id:user.id,email:user.email,displayName:user.display_name,
    weeklyStudyMinutes:user.weekly_study_minutes,reminderDay:user.reminder_day,
    instrument:user.instrument,level:user.study_level,timeZone:user.time_zone,
    reminderEnabled:!!user.reminder_enabled,lastLesson:user.last_lesson};
}

export function sessionToken() { return randomBytes(48).toString("base64url"); }

export function sessionCookie(token: string) {
  return `appbass_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;
}
