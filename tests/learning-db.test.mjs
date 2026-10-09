import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import sql from 'mssql';
import {connectBetaPool} from '../lib/beta-sql-guard.mjs';
import {validateLearning} from '../lib/learning-validation.mjs';
import {LearningStore,localImportItems} from '../public/learning-store.mjs';
test('wrong database is refused before connect; connected mismatch closes without any beta query',async()=>{
 let connects=0,closed=0,queries=[];
 class Pool{constructor(value){this.config={database:value,server:'sqldb-orquestaoesat.database.windows.net',options:{}};}async connect(){connects++;}request(){return {query:async q=>{queries.push(q);return {recordset:[{name:'WrongDB'}]};}};}async close(){closed++;}}
 await assert.rejects(connectBetaPool('WrongDB',Pool));assert.equal(connects,0);
 await assert.rejects(connectBetaPool('AppbassBeta',Pool));assert.equal(closed,1);assert.deepEqual(queries,['SELECT DB_NAME() AS name']);
 for(const cs of ['Server=example.invalid;Database=WrongDB;','Data Source=example.invalid;Initial Catalog=WrongDB;','Server=example.invalid;','Server=example.invalid;Database=AppbassBeta;'])await assert.rejects(connectBetaPool(cs,sql.ConnectionPool),e=>e.code==='BETA_SQL_TARGET');
});
test('learning requests reject foreign owners, invalid IDs, preference keys and noninteger versions',()=>{
 assert.deepEqual(validateLearning({kind:'preference',section:'practice',version:0,value:{instrument:'electricBass5'}}).value,{instrument:'electricBass5'});
 for(const b of [{kind:'unit',unitId:'H99',reviewed:true,version:0},{kind:'unit',unitId:'H01',reviewed:true,version:-1},{kind:'review',lessonId:'B99',tempo:60,rating:'hard',eventId:'x'},{kind:'preference',section:'__proto__',version:0,value:{}},{kind:'preference',section:'avatar',version:0,value:{admin:true}},{kind:'preference',section:'session',version:0,value:{minutes:15},userId:'other'}])assert.throws(()=>validateLearning(b));
});
test('new migration is guarded, additive, scoped and has exactly five new learning tables',()=>{
 const ddl=readFileSync(new URL('../infra/appbass-beta-learning.sql',import.meta.url),'utf8');
 assert.match(ddl,/IF DB_NAME\(\) <> 'AppbassBeta' THROW/);assert.equal((ddl.match(/CREATE TABLE/g)||[]).length,5);
 assert.doesNotMatch(ddl.replace(/--[^\n]*/g,'').replace('ALTER TABLE dbo.beta_learning_daily_progress ADD reviewed BIT NOT NULL DEFAULT 1;',''),/\b(DROP|DELETE|TRUNCATE|ALTER|USE)\s+/i);assert.doesNotMatch(ddl,/UsuariosOESAT|CREATE LOGIN|ALTER SERVER/i);
});
test('queued preference writes merge latest versions; conflicts and session changes never falsely succeed',async()=>{
 const state={preferences:{},reviews:{},units:{},daily:[]},calls=[];
 const store=new LearningStore(async(url,options)=>{if(options.method==='GET')return {ok:true,json:async()=>structuredClone(state)};const b=JSON.parse(options.body);calls.push(b);state.preferences[b.section]={value:b.value,version:b.version+1};return {ok:true,json:async()=>({version:b.version+1})};});
 await store.setUser({id:'a'});await Promise.all([store.setPreference('avatar',{color:'gold'}),store.setPreference('avatar',{motion:false})]);assert.equal(calls[1].version,1);assert.deepEqual(calls[1].value,{color:'gold',motion:false});
 const pending=store.setPreference('session',{minutes:15});store.beginSession();await assert.rejects(pending);assert.equal(calls.length,2);
 store.fetcher=async()=>({ok:false,json:async()=>({error:'Conflict'})});await store.setUser({id:'a'});await assert.rejects(store.setPreference('session',{minutes:15}));
});
test('explicit local import never reads guest/another account and skips existing cloud records',()=>{
 const keys=[],storage={getItem(k){keys.push(k);return k==='appbass-practice-a'?JSON.stringify({instrument:'electricBass5',tempo:72}):null;}};
 const state={preferences:{},reviews:{},units:{},daily:[]};assert.equal(localImportItems({id:'a'},storage,state).length,1);assert.ok(keys.every(k=>k.endsWith('-a')));
 state.preferences.practice={value:{tempo:90},version:2};assert.equal(localImportItems({id:'a'},storage,state).length,0);assert.deepEqual(localImportItems(null,storage,state),[]);
});
