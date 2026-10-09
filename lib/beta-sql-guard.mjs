export const BETA_DATABASE='AppbassBeta';
export const BETA_SERVER='sqldb-orquestaoesat.database.windows.net';
// Parse with the driver's own parser; refuse the target BEFORE opening a socket.
export async function connectBetaPool(value,Pool){
 if(!value)throw Object.assign(new Error('Beta SQL not configured'),{code:'BETA_SQL_CONFIG'});
 const pool=new Pool(value);
 if(pool.config.database!==BETA_DATABASE||pool.config.server?.toLowerCase()!==BETA_SERVER)throw Object.assign(new Error('Beta SQL target refused'),{code:'BETA_SQL_TARGET'});
 pool.config.options={...pool.config.options,encrypt:true,trustServerCertificate:false};
 try{
  await pool.connect();
  const result=await pool.request().query('SELECT DB_NAME() AS name');
  if(result.recordset[0]?.name!==BETA_DATABASE)throw Object.assign(new Error('Beta SQL target refused'),{code:'BETA_SQL_TARGET'});
  return pool;
 }catch(error){try{await pool.close();}catch{}throw error;}
}
