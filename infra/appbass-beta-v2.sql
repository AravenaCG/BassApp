-- Additive, repeatable migration. Only this database is in scope.
IF DB_NAME() <> 'AppbassBeta' THROW 51000, 'Expected AppbassBeta', 1;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF COL_LENGTH('dbo.beta_users','instrument') IS NULL
 EXEC('ALTER TABLE dbo.beta_users ADD instrument NVARCHAR(20) NOT NULL DEFAULT ''electricBass'', study_level NVARCHAR(20) NOT NULL DEFAULT ''basic'', time_zone NVARCHAR(80) NOT NULL DEFAULT ''America/Argentina/Buenos_Aires'', reminder_enabled BIT NOT NULL DEFAULT 1, reminder_snoozed_until DATETIME2 NULL, last_lesson NVARCHAR(10) NULL');
IF OBJECT_ID('dbo.beta_lesson_states') IS NULL
 CREATE TABLE dbo.beta_lesson_states (
 user_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.beta_users(id),
 lesson_id NVARCHAR(10) NOT NULL,
 state NVARCHAR(20) NOT NULL CHECK(state IN ('read','practiced','review')),
 updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
 PRIMARY KEY(user_id,lesson_id));
IF OBJECT_ID('dbo.beta_journal') IS NULL
 CREATE TABLE dbo.beta_journal (
 id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
 user_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.beta_users(id),
 exercise NVARCHAR(160) NOT NULL, minutes INT NOT NULL CHECK(minutes BETWEEN 1 AND 600),
 tempo INT NOT NULL CHECK(tempo BETWEEN 30 AND 240),
 note NVARCHAR(2000) NOT NULL, created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME());
IF OBJECT_ID('dbo.beta_feedback') IS NULL
 CREATE TABLE dbo.beta_feedback (
 id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
 user_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.beta_users(id),
 context NVARCHAR(200) NOT NULL, message NVARCHAR(2000) NOT NULL,
 created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME());
IF OBJECT_ID('dbo.beta_auth_limits') IS NULL
 CREATE TABLE dbo.beta_auth_limits (
 key_hash VARCHAR(64) NOT NULL PRIMARY KEY, attempts INT NOT NULL,
 window_start DATETIME2 NOT NULL);
COMMIT;
