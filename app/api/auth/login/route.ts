import { getSqlPool, sql } from "../../../../lib/azure-sql";
import { verifyPassword } from "../../../../lib/passwords";
import { sessionCookie, sessionToken } from "../../../../lib/beta-auth";

export async function POST(request: Request) {
  try { const body=await request.json(); const email=String(body.email??"").trim().toLowerCase(); const password=String(body.password??""); const pool=await getSqlPool(); const result=await pool.request().input("email",sql.NVarChar(320),email).query("SELECT TOP 1 id,email,display_name,password_hash FROM dbo.beta_users WHERE email=@email AND is_active=1"); const user=result.recordset[0]; if(!user || !(await verifyPassword(password,user.password_hash))) return Response.json({error:"Correo o contraseña incorrectos."},{status:401}); const token=sessionToken(); await pool.request().input("token",sql.VarChar(128),token).input("user",sql.UniqueIdentifier,user.id).query("INSERT INTO dbo.beta_sessions(token,user_id,expires_at) VALUES(@token,@user,DATEADD(day,30,SYSUTCDATETIME()))"); return Response.json({user:{id:user.id,email:user.email,displayName:user.display_name}},{headers:{"Set-Cookie":sessionCookie(token),"Cache-Control":"no-store"}}); } catch(error) { console.error("Login failed",error); return Response.json({error:"No se pudo iniciar sesión."},{status:503}); }
}
