import { requireBetaUser } from "../../../lib/beta-auth";
import { getSqlPool, sql } from "../../../lib/azure-sql";
import { bodyOf, failure, json, HttpError } from "../../../lib/http";
import { hashPassword, verifyPassword } from "../../../lib/passwords";
import { limitAuth } from "../../../lib/auth-limit";
export async function PATCH(request:Request) {
  try {
    const b=await bodyOf(request),user=await requireBetaUser(request);
    const name=String(b.displayName??"").trim(), minutes=Number(b.weeklyStudyMinutes), day=Number(b.reminderDay);
    if(!name||name.length>120||!Number.isInteger(minutes)||minutes<15||minutes>1200||!Number.isInteger(day)||day<1||day>7||
      !["electricBass","doubleBass"].includes(b.instrument)||!["basic","intermediate","advanced"].includes(b.level)||typeof b.reminderEnabled!=="boolean")
      throw new HttpError(400,"Revisá tu nombre y preferencias.");
    const zone=String(b.timeZone||"");
    try { new Intl.DateTimeFormat("es",{timeZone:zone}).format(); } catch { throw new HttpError(400,"Zona horaria inválida."); }
    const pool=await getSqlPool();
    await pool.request().input("user",sql.UniqueIdentifier,user.id).input("name",sql.NVarChar(120),name)
      .input("minutes",sql.Int,minutes).input("day",sql.TinyInt,day).input("instrument",sql.NVarChar(20),b.instrument)
      .input("level",sql.NVarChar(20),b.level).input("zone",sql.NVarChar(80),zone).input("enabled",sql.Bit,b.reminderEnabled)
      .query("UPDATE dbo.beta_users SET display_name=@name,weekly_study_minutes=@minutes,reminder_day=@day,instrument=@instrument,study_level=@level,time_zone=@zone,reminder_enabled=@enabled WHERE id=@user");
    return json({ok:true});
  } catch(e) { return failure(e); }
}
export async function POST(request:Request) {
  try {
    const b=await bodyOf(request),user=await requireBetaUser(request);
    if(typeof b.password!=="string"||b.password.length<10||b.password.length>256||typeof b.currentPassword!=="string"||b.currentPassword.length>256)
      throw new HttpError(400,"La contraseña nueva debe tener entre 10 y 256 caracteres.");
    await limitAuth(user.email);
    const pool=await getSqlPool();
    const r=await pool.request().input("id",sql.UniqueIdentifier,user.id).query("SELECT password_hash FROM dbo.beta_users WHERE id=@id");
    if(!await verifyPassword(b.currentPassword,r.recordset[0].password_hash)) throw new HttpError(400,"La contraseña actual no coincide.");
    const hash=await hashPassword(b.password);
    await pool.request().input("id",sql.UniqueIdentifier,user.id).input("hash",sql.NVarChar(300),hash)
      .query("SET XACT_ABORT ON; BEGIN TRANSACTION; UPDATE dbo.beta_users SET password_hash=@hash WHERE id=@id; DELETE dbo.beta_sessions WHERE user_id=@id; COMMIT;");
    return json({ok:true},200,{"Set-Cookie":"appbass_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"});
  } catch(e) { return failure(e); }
}
