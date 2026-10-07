import { getSqlPool, sql } from "../../../../lib/azure-sql";
import { verifyPassword, hashPassword } from "../../../../lib/passwords";
import { sessionCookie, sessionToken, publicUser } from "../../../../lib/beta-auth";
import { bodyOf, failure, json, HttpError } from "../../../../lib/http";
import { limitAuth } from "../../../../lib/auth-limit";
const dummyHash = hashPassword("not-a-real-account-password");
export async function POST(request: Request) {
  try {
    const body=await bodyOf(request);
    const email=String(body.email??"").trim().toLowerCase(), password=String(body.password??"");
    if(!email || email.length>320 || !password || password.length>256) throw new HttpError(400,"Revisá el correo y la contraseña.");
    await limitAuth(email);
    const pool=await getSqlPool();
    const result=await pool.request().input("email",sql.NVarChar(320),email).query("SELECT TOP 1 * FROM dbo.beta_users WHERE email=@email AND is_active=1");
    const user=result.recordset[0];
    const valid=await verifyPassword(password,user?.password_hash || await dummyHash);
    if(!user || !valid) throw new HttpError(401,"Correo o contraseña incorrectos.");
    const token=sessionToken();
    await pool.request().input("token",sql.VarChar(128),token).input("user",sql.UniqueIdentifier,user.id).query("INSERT dbo.beta_sessions(token,user_id,expires_at) VALUES(@token,@user,DATEADD(day,30,SYSUTCDATETIME()))");
    return json({user:publicUser(user)},200,{"Set-Cookie":sessionCookie(token)});
  } catch(e) { return failure(e); }
}
