import sql from 'mssql';
import {readFile} from 'node:fs/promises';
import {connectBetaPool} from '../lib/beta-sql-guard.mjs';
const pool=await connectBetaPool(process.env.AZURE_SQL_CONNECTION_STRING,sql.ConnectionPool);
try {
  const db=await pool.request().query('SELECT DB_NAME() AS name');
  if(db.recordset[0].name!=='AppbassBeta')throw Error('Unexpected target database');
  await pool.request().batch(await readFile(new URL('../infra/appbass-beta-v2.sql',import.meta.url),'utf8'));
  const r=await pool.request().query("SELECT COUNT(*) AS n FROM sys.tables WHERE name IN ('beta_lesson_states','beta_journal','beta_feedback','beta_auth_limits')");
  if(r.recordset[0].n!==4)throw Error('Schema validation failed');
  console.log('AppbassBeta: additive migration verified (4 tables).');
} catch(e) { console.error('Migration failed:',e.code||e.name);process.exitCode=1; }
finally {await pool.close();}
