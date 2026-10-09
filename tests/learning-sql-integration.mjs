import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import sql from 'mssql';
import {connectBetaPool} from '../lib/beta-sql-guard.mjs';
import {readLearningData,saveLearningData} from '../lib/learning-service.mjs';
import {validateLearning} from '../lib/learning-validation.mjs';
import {dailyChallenge} from '../public/atlas-engine.mjs';
let pool,tx,active=false;
try{
 pool=await connectBetaPool(process.env.AZURE_SQL_CONNECTION_STRING,sql.ConnectionPool);
 tx=new sql.Transaction(pool);await tx.begin();active=true;tx.on('rollback',()=>active=false);
 const scope={request:()=>new sql.Request(tx)},a=randomUUID(),b=randomUUID();
 for(const id of [a,b])await scope.request().input('id',sql.UniqueIdentifier,id).input('email',sql.NVarChar(320),'learning-transaction-'+id+'@example.test').query("INSERT dbo.beta_users(id,email,display_name,password_hash) VALUES(@id,@email,'Transactional fixture','not-a-login')");
 const save=body=>saveLearningData(scope,a,validateLearning(body));
 const pref={kind:'preference',section:'practice',version:0,value:{instrument:'electricBass5',tempo:72}};
 assert.equal((await save(pref)).version,1);await assert.rejects(save(pref),e=>e.status===409);
 const event={kind:'review',lessonId:'B01',tempo:72,rating:'okay',eventId:randomUUID()};await save(event);await save(event);
 await save({kind:'unit',unitId:'H01',reviewed:true,version:0});
 const challenge=dailyChallenge(),daily={kind:'daily',date:challenge.date,familyId:challenge.families[0],reviewed:true};await save(daily);await save({...daily,reviewed:false});
 const first=await readLearningData(scope,a),second=await readLearningData(scope,b);
 assert.equal(first.preferences.practice.value.instrument,'electricBass5');assert.equal(first.reviews.B01.history.length,1);assert.equal(first.units.H01.reviewed,true);assert.equal(first.daily[0].reviewed,false);
 assert.deepEqual(second,{preferences:{},reviews:{},units:{},daily:[]});
 await tx.rollback();active=false;
 const count=await pool.request().input('a',sql.UniqueIdentifier,a).input('b',sql.UniqueIdentifier,b).query('SELECT COUNT(*) AS n FROM dbo.beta_users WHERE id IN (@a,@b)');assert.equal(count.recordset[0].n,0);
 console.log('AppbassBeta learning SQL: isolation, version conflict, deduplication, unit/daily updates verified; entire fixture transaction rolled back, no student records changed.');
}catch(e){console.error('Learning SQL integration failed:',e.code||e.name);process.exitCode=1;}
finally{if(active)try{await tx.rollback();}catch{}await pool?.close();}
