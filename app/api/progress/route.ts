import { requireBetaUser } from "../../../lib/beta-auth";
import { getSqlPool, sql } from "../../../lib/azure-sql";
import { json, bodyOf, failure, HttpError } from "../../../lib/http";
import { LESSON_IDS, nextLesson } from "../../../lib/study.mjs";
export const dynamic = "force-dynamic";
async function read(userId: string) {
  const pool = await getSqlPool();
  const r = await pool.request().input("user",sql.UniqueIdentifier,userId).query(
    "SELECT lesson_id FROM dbo.beta_progress WHERE user_id=@user ORDER BY completed_at; SELECT COALESCE(SUM(points),0) AS total FROM dbo.beta_progress WHERE user_id=@user; SELECT lesson_id,state FROM dbo.beta_lesson_states WHERE user_id=@user;");
  const sets = r.recordsets as sql.IRecordSet<any>[];
  return {completed:sets[0].map(x=>x.lesson_id),totalPoints:sets[1][0].total,pointsPerLesson:100,
    states:Object.fromEntries(sets[2].map(x=>[x.lesson_id,x.state]))};
}
export async function GET(request: Request) {
  try { const user=await requireBetaUser(request); return json(await read(user.id)); }
  catch(e) { return failure(e); }
}
export async function POST(request: Request) {
  try {
    const body=await bodyOf(request), user=await requireBetaUser(request), id=body.lessonId;
    if (!LESSON_IDS.includes(id)) throw new HttpError(400,"Lección inválida.");
    const pool=await getSqlPool();
    const r=await pool.request().input("user",sql.UniqueIdentifier,user.id).input("lesson",sql.NVarChar(10),id).query(`
      SET XACT_ABORT ON;
      BEGIN TRANSACTION;
      DECLARE @lock INT, @resource NVARCHAR(255)=CONCAT('progress-',@user), @awarded INT=0;
      EXEC @lock=sp_getapplock @Resource=@resource,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=10000;
      IF @lock<0 THROW 51001,'Progress lock unavailable',1;
      IF NOT EXISTS(SELECT 1 FROM dbo.beta_progress WHERE user_id=@user AND lesson_id=@lesson)
      BEGIN
        INSERT dbo.beta_progress(user_id,lesson_id,points) VALUES(@user,@lesson,100);
        INSERT dbo.beta_points_ledger(user_id,amount,reason,reference) VALUES(@user,100,'lesson',@lesson);
        SET @awarded=100;
      END;
      UPDATE dbo.beta_users SET last_lesson=@lesson WHERE id=@user;
      COMMIT;
      SELECT @awarded AS awarded;
    `);
    const progress=await read(user.id);
    return json({...progress,awardedPoints:r.recordset[0].awarded,nextLessonId:nextLesson(id,progress.completed)});
  } catch(e) { return failure(e); }
}
