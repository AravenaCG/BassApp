import sql from 'mssql';
export async function readLearningData(pool,userId){
 const r=await pool.request().input('user',sql.UniqueIdentifier,userId).query(`
 SELECT section,value,version FROM dbo.beta_learning_preferences WHERE user_id=@user;
 SELECT lesson_id AS lessonId,due_at AS due FROM dbo.beta_learning_reviews WHERE user_id=@user;
 WITH history AS (SELECT lesson_id AS lessonId,tempo,rating,created_at AS at,
 ROW_NUMBER() OVER(PARTITION BY lesson_id ORDER BY created_at DESC,event_id DESC) AS n
 FROM dbo.beta_learning_review_history WHERE user_id=@user)
 SELECT lessonId,tempo,rating,at FROM history WHERE n<=5 ORDER BY at;
 SELECT unit_id AS unitId,reviewed,version FROM dbo.beta_learning_unit_progress WHERE user_id=@user;
 SELECT CONVERT(char(10),challenge_date,23) AS date,family_id AS familyId,reviewed FROM dbo.beta_learning_daily_progress WHERE user_id=@user AND challenge_date>=DATEADD(day,-60,CAST(SYSUTCDATETIME() AS date));`);
 const sets=r.recordsets;
 return {preferences:Object.fromEntries(sets[0].map(p=>[p.section,{value:JSON.parse(p.value),version:p.version}])),
 reviews:Object.fromEntries(sets[1].map(p=>[p.lessonId,{due:p.due,history:sets[2].filter(h=>h.lessonId===p.lessonId).map(({tempo,rating,at})=>({tempo,rating,at}))}])),
 units:Object.fromEntries(sets[3].map(p=>[p.unitId,{reviewed:p.reviewed,version:p.version}])),daily:sets[4]};
}
export async function saveLearningData(pool,userId,b){
 const q=pool.request().input('user',sql.UniqueIdentifier,userId);
 if(b.kind==='preference'||b.kind==='unit'){
 const preference=b.kind==='preference',table=preference?'beta_learning_preferences':'beta_learning_unit_progress',key=preference?'section':'unit_id',column=preference?'value':'reviewed';
 q.input('key',sql.NVarChar(20),preference?b.section:b.unitId).input('expected',sql.Int,b.version).input('value',preference?sql.NVarChar(4000):sql.Bit,preference?JSON.stringify(b.value):b.reviewed);
 const r=await q.query(`SET XACT_ABORT ON; BEGIN TRANSACTION;
 DECLARE @version INT; SELECT @version=version FROM dbo.${table} WITH(UPDLOCK,HOLDLOCK) WHERE user_id=@user AND ${key}=@key;
 IF COALESCE(@version,0)<>@expected BEGIN COMMIT; SELECT CAST(0 AS bit) AS saved; END
 ELSE BEGIN
 IF @version IS NULL INSERT dbo.${table}(user_id,${key},${column}) VALUES(@user,@key,@value);
 ELSE UPDATE dbo.${table} SET ${column}=@value,version=version+1,updated_at=SYSUTCDATETIME() WHERE user_id=@user AND ${key}=@key;
 COMMIT; SELECT CAST(1 AS bit) AS saved,@expected+1 AS version; END;`);
 if(!r.recordset[0]?.saved)throw Object.assign(new Error('Hay cambios más recientes en otro dispositivo. Recargá antes de guardar.'),{status:409});
 return {ok:true,version:r.recordset[0].version};
 }
 if(b.kind==='review'){
 q.input('event',sql.UniqueIdentifier,b.eventId).input('lesson',sql.NVarChar(10),b.lessonId).input('tempo',sql.SmallInt,b.tempo).input('rating',sql.NVarChar(10),b.rating).input('days',sql.Int,({hard:1,okay:3,easy:7})[b.rating]);
 await q.query(`SET XACT_ABORT ON; BEGIN TRANSACTION;
 IF NOT EXISTS(SELECT 1 FROM dbo.beta_learning_review_history WITH(UPDLOCK,HOLDLOCK) WHERE user_id=@user AND event_id=@event) BEGIN
 INSERT dbo.beta_learning_review_history(user_id,event_id,lesson_id,tempo,rating) VALUES(@user,@event,@lesson,@tempo,@rating);
 UPDATE dbo.beta_learning_reviews WITH(UPDLOCK,HOLDLOCK) SET due_at=DATEADD(day,@days,SYSUTCDATETIME()),updated_at=SYSUTCDATETIME() WHERE user_id=@user AND lesson_id=@lesson;
 IF @@ROWCOUNT=0 INSERT dbo.beta_learning_reviews(user_id,lesson_id,due_at) VALUES(@user,@lesson,DATEADD(day,@days,SYSUTCDATETIME())); END; COMMIT;`);
 }else if(b.kind==='daily'){
 await q.input('date',sql.Date,new Date(b.date)).input('family',sql.NVarChar(40),b.familyId).input('reviewed',sql.Bit,b.reviewed).query(`SET XACT_ABORT ON; BEGIN TRANSACTION;
 UPDATE dbo.beta_learning_daily_progress WITH(UPDLOCK,HOLDLOCK) SET reviewed=@reviewed WHERE user_id=@user AND challenge_date=@date AND family_id=@family;
 IF @@ROWCOUNT=0 INSERT dbo.beta_learning_daily_progress(user_id,challenge_date,family_id,reviewed) VALUES(@user,@date,@family,@reviewed); COMMIT;`);
 }
 return {ok:true};
}
