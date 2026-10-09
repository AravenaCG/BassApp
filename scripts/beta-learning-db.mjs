import sql from 'mssql';
import {readFile} from 'node:fs/promises';
import {connectBetaPool} from '../lib/beta-sql-guard.mjs';
let pool;
try{
 pool=await connectBetaPool(process.env.AZURE_SQL_CONNECTION_STRING,sql.ConnectionPool);
 const ddl=await readFile(new URL('../infra/appbass-beta-learning.sql',import.meta.url),'utf8');
 for(let i=0;i<2;i++)await pool.request().batch(ddl);
 const r=await pool.request().query("SELECT COUNT(*) AS n FROM sys.tables WHERE name IN ('beta_learning_preferences','beta_learning_reviews','beta_learning_review_history','beta_learning_unit_progress','beta_learning_daily_progress')");
 if(r.recordset[0].n!==5)throw Error('Schema verification failed');
 console.log('AppbassBeta: five additive learning tables verified; repeat migration succeeded. No user records changed.');
}catch(e){console.error('Beta learning migration failed:',e.code||e.name);process.exitCode=1;}
finally{await pool?.close();}
