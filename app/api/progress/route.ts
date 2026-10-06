import { currentBetaUser } from "../../../lib/beta-auth";
import { getSqlPool, sql } from "../../../lib/azure-sql";

export const dynamic = "force-dynamic";
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
export async function GET(request:Request){
 const user=await currentBetaUser(request); if(!user)return json({error:"Inicia sesion para guardar tu progreso."},401);
 try{const r=await(await getSqlPool()).request().input("user",sql.UniqueIdentifier,user.id).query("SELECT lesson_id AS lessonId,points,completed_at AS completedAt FROM dbo.beta_progress WHERE user_id=@user ORDER BY completed_at");return json({completed:r.recordset,totalPoints:r.recordset.reduce((n,row)=>n+row.points,0)});}catch(e){console.error(e);return json({error:"No pudimos cargar tu progreso."},503);}
}
export async function POST(request:Request){
 const user=await currentBetaUser(request); if(!user)return json({error:"Inicia sesion para guardar tu progreso."},401);
 if(request.headers.get("origin")!==new URL(request.url).origin)return json({error:"Solicitud no permitida."},403);
 try{const lessonId=(await request.json()).lessonId;if(typeof lessonId!=="string"||lessonId.length<1||lessonId.length>120)return json({error:"Leccion invalida."},400);const p=await getSqlPool();await p.request().input("user",sql.UniqueIdentifier,user.id).input("lesson",sql.NVarChar(120),lessonId).query("IF NOT EXISTS (SELECT 1 FROM dbo.beta_progress WHERE user_id=@user AND lesson_id=@lesson) BEGIN INSERT INTO dbo.beta_progress(user_id,lesson_id,points) VALUES(@user,@lesson,100); INSERT INTO dbo.beta_points_ledger(user_id,amount,reason,reference) VALUES(@user,100,'lesson',@lesson); END");return GET(request);}catch(e){console.error(e);return json({error:"No pudimos guardar la leccion."},503);}
}
