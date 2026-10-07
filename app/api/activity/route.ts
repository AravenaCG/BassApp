import { requireBetaUser } from "../../../lib/beta-auth";
import { getSqlPool, sql } from "../../../lib/azure-sql";
import { bodyOf, failure, json, HttpError } from "../../../lib/http";
import { LESSON_IDS } from "../../../lib/study.mjs";
export async function GET(request:Request) {
  try {
    const user=await requireBetaUser(request),pool=await getSqlPool();
    const r=await pool.request().input("user",sql.UniqueIdentifier,user.id)
      .query("SELECT TOP 30 id,exercise,minutes,tempo,note,created_at AS createdAt FROM dbo.beta_journal WHERE user_id=@user ORDER BY created_at DESC; SELECT COALESCE(SUM(minutes),0) AS minutes FROM dbo.beta_journal WHERE user_id=@user AND created_at>=DATEADD(day,-7,SYSUTCDATETIME())");
    const sets=r.recordsets as sql.IRecordSet<any>[];
    return json({entries:sets[0],weeklyMinutes:sets[1][0].minutes});
  } catch(e) { return failure(e); }
}
export async function POST(request:Request) {
  try {
    const b=await bodyOf(request),user=await requireBetaUser(request),pool=await getSqlPool();
    const q=pool.request().input("user",sql.UniqueIdentifier,user.id);
    if(b.kind==="journal") {
      if(typeof b.exercise!=="string"||!b.exercise.trim()||b.exercise.length>160||!Number.isInteger(b.minutes)||b.minutes<1||b.minutes>600||
        !Number.isInteger(b.tempo)||b.tempo<30||b.tempo>240||typeof b.note!=="string"||b.note.length>2000) throw new HttpError(400,"Revisá los datos de la práctica.");
      await q.input("exercise",sql.NVarChar(160),b.exercise).input("minutes",sql.Int,b.minutes).input("tempo",sql.Int,b.tempo).input("note",sql.NVarChar(2000),b.note)
        .query("INSERT dbo.beta_journal(user_id,exercise,minutes,tempo,note) VALUES(@user,@exercise,@minutes,@tempo,@note)");
    } else if(b.kind==="lesson") {
      if(!LESSON_IDS.includes(b.lessonId)||!["opened","read","practiced","review"].includes(b.state)) throw new HttpError(400,"Lección inválida.");
      q.input("lesson",sql.NVarChar(10),b.lessonId).input("state",sql.NVarChar(20),b.state);
      await q.query(`SET XACT_ABORT ON; BEGIN TRANSACTION;
        UPDATE dbo.beta_users SET last_lesson=@lesson WHERE id=@user;
        IF @state<>'opened' BEGIN
          UPDATE dbo.beta_lesson_states WITH(UPDLOCK,SERIALIZABLE) SET state=@state,updated_at=SYSUTCDATETIME() WHERE user_id=@user AND lesson_id=@lesson;
          IF @@ROWCOUNT=0 INSERT dbo.beta_lesson_states(user_id,lesson_id,state) VALUES(@user,@lesson,@state);
        END;
        COMMIT;`);
    } else if(b.kind==="reminder") {
      if(!["dismiss","snooze"].includes(b.action)) throw new HttpError(400,"Acción inválida.");
      await q.query(b.action==="snooze"
        ? "UPDATE dbo.beta_users SET reminder_snoozed_until=DATEADD(day,1,SYSUTCDATETIME()) WHERE id=@user"
        : "UPDATE dbo.beta_users SET last_reminder_at=SYSUTCDATETIME(),reminder_snoozed_until=NULL WHERE id=@user");
    } else if(b.kind==="feedback") {
      if(typeof b.message!=="string"||b.message.trim().length<5||b.message.length>2000||typeof b.context!=="string"||b.context.length>200) throw new HttpError(400,"Contanos el problema en 5 a 2000 caracteres.");
      await q.input("context",sql.NVarChar(200),b.context).input("message",sql.NVarChar(2000),b.message)
        .query("INSERT dbo.beta_feedback(user_id,context,message) VALUES(@user,@context,@message)");
    } else throw new HttpError(400,"Actividad inválida.");
    return json({ok:true});
  } catch(e) { return failure(e); }
}
