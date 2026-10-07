import { createHash } from "node:crypto";
import { getSqlPool, sql } from "./azure-sql";
import { HttpError } from "./http";
export async function limitAuth(email: string) {
  const hash=createHash("sha256").update(email).digest("hex");
  const r=await(await getSqlPool()).request().input("key",sql.VarChar(64),hash).query(`
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;
    DECLARE @n INT, @lock INT, @resource NVARCHAR(255)=CONCAT('auth-',@key);
    EXEC @lock=sp_getapplock @Resource=@resource,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=5000;
    IF @lock<0 THROW 51002,'Auth lock unavailable',1;
    DELETE dbo.beta_auth_limits WHERE window_start<DATEADD(day,-1,SYSUTCDATETIME());
    IF EXISTS(SELECT 1 FROM dbo.beta_auth_limits WHERE key_hash=@key)
      UPDATE dbo.beta_auth_limits SET attempts=CASE WHEN window_start<DATEADD(minute,-15,SYSUTCDATETIME()) THEN 1 ELSE attempts+1 END,
        window_start=CASE WHEN window_start<DATEADD(minute,-15,SYSUTCDATETIME()) THEN SYSUTCDATETIME() ELSE window_start END WHERE key_hash=@key;
    ELSE INSERT dbo.beta_auth_limits VALUES(@key,1,SYSUTCDATETIME());
    SELECT @n=attempts FROM dbo.beta_auth_limits WHERE key_hash=@key;
    COMMIT;
    SELECT @n AS attempts;
  `);
  if(r.recordset[0].attempts>12) throw new HttpError(429,"Demasiados intentos. Esperá 15 minutos.");
}
