import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import sql from 'mssql';
const origin=process.env.APPBASS_TEST_URL||'http://127.0.0.1:3100';
const run=randomUUID(),invite=randomUUID(),password=randomUUID();
const emails=[0,1,2].map(n=>`integration-${run}-${n}@example.test`);
const pool=await new sql.ConnectionPool(process.env.AZURE_SQL_CONNECTION_STRING).connect();
const hash=s=>createHash('sha256').update(s).digest();
let inviteId;
async function call(path,body,cookie='',method='POST'){
 const r=await fetch(origin+path,{method:body===undefined?'GET':method,headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)});
 return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};
}
const signup=(n,extra={})=>call('/api/auth/register',{email:emails[n],password,displayName:'Integration fixture',inviteCode:invite,weeklyStudyMinutes:120,reminderDay:2,...extra});
try {
 assert.equal((await pool.request().query('SELECT DB_NAME() AS name')).recordset[0].name,'AppbassBeta');
 inviteId=(await pool.request().input('hash',sql.VarBinary(32),hash(invite)).query('INSERT dbo.beta_invite_codes(code_hash,max_uses) OUTPUT INSERTED.id VALUES(@hash,2)')).recordset[0].id;
 assert.equal((await call('/api/progress')).status,401);
 assert.equal((await signup(0,{inviteCode:'invalid-fixture'})).status,403);
 const a=await signup(0);assert.equal(a.status,201,JSON.stringify(a.body));assert.ok(a.cookie);
 const attempts=await Promise.all([signup(1,{referralCode:a.body.user.id}),signup(2)]);
 assert.deepEqual(attempts.map(x=>x.status).sort(),[201,403]);
 const b=attempts.find(x=>x.status===201);
 const repeated=await Promise.all([call('/api/progress',{lessonId:'B01'},a.cookie),call('/api/progress',{lessonId:'B01'},a.cookie)]);
 assert.deepEqual(repeated.map(x=>x.status),[200,200]);
 assert.equal(repeated.reduce((sum,x)=>sum+x.body.awardedPoints,0),100);
 assert.equal((await call('/api/progress',undefined,b.cookie)).body.totalPoints,0);
 assert.equal((await call('/api/progress',{lessonId:'B99'},a.cookie)).status,400);
 for(const body of [
  {kind:'lesson',lessonId:'B03',state:'review'},
  {kind:'journal',exercise:'Test practice',minutes:5,tempo:80,note:'Temporary test fixture'},
  {kind:'feedback',context:'integration',message:'Temporary automated test'},
  {kind:'reminder',action:'snooze'}
 ])assert.equal((await call('/api/activity',body,a.cookie)).status,200);
 const activity=await call('/api/activity',undefined,a.cookie);assert.equal(activity.body.entries.length,1);assert.equal(activity.body.weeklyMinutes,5);
 assert.equal((await call('/api/activity',undefined,b.cookie)).body.entries.length,0);
 assert.equal((await call('/api/progress',undefined,a.cookie)).body.states.B03,'review');
 assert.equal((await call('/api/profile',{displayName:'Changed fixture',weeklyStudyMinutes:60,reminderDay:5,instrument:'doubleBass',level:'intermediate',timeZone:'America/Argentina/Buenos_Aires',reminderEnabled:true},a.cookie,'PATCH')).status,200);
 const me=(await call('/api/auth/me',undefined,a.cookie)).body;
 assert.equal(me.user.weeklyStudyMinutes,60);assert.equal(me.user.instrument,'doubleBass');assert.equal(me.reminder,false);
 assert.equal((await call('/api/auth/logout',{},a.cookie)).status,200);
 assert.equal((await call('/api/auth/me',undefined,a.cookie)).body.user,null);
 const login=await call('/api/auth/login',{email:emails[0],password});assert.equal(login.status,200);
 const replacement=randomUUID();assert.equal((await call('/api/profile',{currentPassword:password,password:replacement},login.cookie)).status,200);
 assert.equal((await call('/api/progress',undefined,login.cookie)).status,401);
 assert.equal((await call('/api/auth/login',{email:emails[0],password:replacement})).status,200);
 console.log('PASS: registration limits, concurrent invite/progress, isolation, profile, lesson state, journal, feedback, reminder, password and logout.');
} catch(e){console.error('Integration failed:',e.message);process.exitCode=1;}
finally {
 // Only delete fixtures created by this unique test run; never existing users.
 for(const email of emails){
  await pool.request().input('email',sql.NVarChar(320),email).input('hash',sql.VarChar(64),hash(email).toString('hex')).query(`
   SET XACT_ABORT ON; BEGIN TRANSACTION;
   DECLARE @id UNIQUEIDENTIFIER=(SELECT id FROM dbo.beta_users WHERE email=@email);
   DELETE dbo.beta_sessions WHERE user_id=@id;
   DELETE dbo.beta_progress WHERE user_id=@id;
   DELETE dbo.beta_points_ledger WHERE user_id=@id;
   DELETE dbo.beta_lesson_states WHERE user_id=@id;
   DELETE dbo.beta_journal WHERE user_id=@id;
   DELETE dbo.beta_feedback WHERE user_id=@id;
   DELETE dbo.beta_referrals WHERE referrer_id=@id OR referred_id=@id;
   DELETE dbo.beta_users WHERE id=@id;
   DELETE dbo.beta_auth_limits WHERE key_hash=@hash;
   COMMIT;`);
 }
 if(inviteId)await pool.request().input('id',sql.UniqueIdentifier,inviteId).query('DELETE dbo.beta_invite_codes WHERE id=@id');
 await pool.close();console.log('Temporary test accounts, invitation and activity removed.');
}
