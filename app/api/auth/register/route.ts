import { createHash } from "node:crypto";
import { getSqlPool, sql } from "../../../../lib/azure-sql";
import { hashPassword } from "../../../../lib/passwords";
import { sessionCookie, sessionToken, publicUser } from "../../../../lib/beta-auth";
import { bodyOf, failure, json, HttpError } from "../../../../lib/http";
import { limitAuth } from "../../../../lib/auth-limit";
export async function POST(request: Request) {
  try {
    const b=await bodyOf(request);
    const email=String(b.email??"").trim().toLowerCase(), password=String(b.password??"");
    const displayName=String(b.displayName??"").trim(), invite=String(b.inviteCode??"").trim();
    const minutes=Number(b.weeklyStudyMinutes), day=Number(b.reminderDay);
    if(!/^\S+@\S+\.\S+$/.test(email)||email.length>320||password.length<10||password.length>256||
       !displayName||displayName.length>120||!invite||invite.length>128||
       !Number.isInteger(minutes)||minutes<15||minutes>1200||!Number.isInteger(day)||day<1||day>7)
      throw new HttpError(400,"Revisá los campos. La contraseña debe tener entre 10 y 256 caracteres.");
    await limitAuth(email);
    const passwordHash=await hashPassword(password), token=sessionToken();
    const ref=String(b.referralCode??"");
    if(ref && !/^[0-9a-f-]{36}$/i.test(ref)) throw new HttpError(400,"Enlace de referido inválido.");
    const pool=await getSqlPool(), tx=new sql.Transaction(pool);
    await tx.begin();
    try {
      const lock=await new sql.Request(tx).query("DECLARE @r INT; EXEC @r=sp_getapplock @Resource='beta-register',@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=10000; SELECT @r AS result");
      if(lock.recordset[0].result<0) throw new HttpError(503,"Intentá registrarte nuevamente.");
      const count=await new sql.Request(tx).query("SELECT COUNT(*) AS n FROM dbo.beta_users");
      if(count.recordset[0].n>=20) throw new HttpError(403,"La beta alcanzó sus 20 lugares.");
      const invitation=await new sql.Request(tx).input("hash",sql.VarBinary(32),createHash("sha256").update(invite).digest())
        .query("UPDATE dbo.beta_invite_codes SET uses=uses+1 OUTPUT INSERTED.id WHERE code_hash=@hash AND uses<max_uses AND (expires_at IS NULL OR expires_at>SYSUTCDATETIME())");
      if(!invitation.recordset.length) throw new HttpError(403,"Código de habilitación inválido o vencido.");
      if(ref) {
        const r=await new sql.Request(tx).input("ref",sql.UniqueIdentifier,ref).query("SELECT id FROM dbo.beta_users WHERE id=@ref AND is_active=1");
        if(!r.recordset.length) throw new HttpError(400,"El enlace de referido no está disponible.");
      }
      const result=await new sql.Request(tx).input("email",sql.NVarChar(320),email).input("name",sql.NVarChar(120),displayName)
        .input("pw",sql.NVarChar(300),passwordHash).input("minutes",sql.Int,minutes).input("day",sql.TinyInt,day)
        .input("ref",sql.UniqueIdentifier,ref||null)
        .query("INSERT dbo.beta_users(email,display_name,password_hash,weekly_study_minutes,reminder_day,referred_by) OUTPUT INSERTED.* VALUES(@email,@name,@pw,@minutes,@day,@ref)");
      const user=result.recordset[0];
      if(ref) await new sql.Request(tx).input("ref",sql.UniqueIdentifier,ref).input("user",sql.UniqueIdentifier,user.id)
        .query("INSERT dbo.beta_referrals(referrer_id,referred_id) VALUES(@ref,@user)");
      await new sql.Request(tx).input("token",sql.VarChar(128),token).input("user",sql.UniqueIdentifier,user.id)
        .query("INSERT dbo.beta_sessions(token,user_id,expires_at) VALUES(@token,@user,DATEADD(day,30,SYSUTCDATETIME()))");
      await tx.commit();
      return json({user:publicUser(user)},201,{"Set-Cookie":sessionCookie(token)});
    } catch(e) {
      await tx.rollback().catch(()=>{});
      if([2601,2627].includes((e as {number:number}).number)) throw new HttpError(409,"Ese correo ya está registrado. Iniciá sesión.");
      throw e;
    }
  } catch(e) { return failure(e); }
}
