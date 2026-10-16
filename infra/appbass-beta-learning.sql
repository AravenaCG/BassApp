-- Additive and idempotent. Never USE another database or modify shared server objects.
IF DB_NAME() <> 'AppbassBeta' THROW 51000, 'Expected AppbassBeta', 1;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
IF OBJECT_ID('dbo.beta_learning_preferences','U') IS NULL
 CREATE TABLE dbo.beta_learning_preferences (
  user_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.beta_users(id),
  section NVARCHAR(20) NOT NULL CHECK(section IN ('practice','atlas','avatar','session','harmony')),
  value NVARCHAR(4000) NOT NULL CHECK(ISJSON(value)=1),
  version INT NOT NULL DEFAULT 1 CHECK(version>0),
  updated_at DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY(user_id,section));
IF OBJECT_ID('dbo.beta_learning_reviews','U') IS NULL
 CREATE TABLE dbo.beta_learning_reviews (
  user_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.beta_users(id),
  lesson_id NVARCHAR(10) NOT NULL,
  due_at DATETIME2(3) NOT NULL,
  updated_at DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY(user_id,lesson_id));
IF OBJECT_ID('dbo.beta_learning_review_history','U') IS NULL
 CREATE TABLE dbo.beta_learning_review_history (
  user_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.beta_users(id),
  event_id UNIQUEIDENTIFIER NOT NULL,
  lesson_id NVARCHAR(10) NOT NULL,
  tempo SMALLINT NOT NULL CHECK(tempo BETWEEN 30 AND 200),
  rating NVARCHAR(10) NOT NULL CHECK(rating IN ('hard','okay','easy')),
  created_at DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY(user_id,event_id));
IF OBJECT_ID('dbo.beta_learning_unit_progress','U') IS NULL
 CREATE TABLE dbo.beta_learning_unit_progress (
  user_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.beta_users(id),
  unit_id NVARCHAR(10) NOT NULL,
  reviewed BIT NOT NULL,
  version INT NOT NULL DEFAULT 1 CHECK(version>0),
  updated_at DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY(user_id,unit_id));
IF OBJECT_ID('dbo.beta_learning_daily_progress','U') IS NULL
 CREATE TABLE dbo.beta_learning_daily_progress (
  user_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.beta_users(id),
  challenge_date DATE NOT NULL,
  family_id NVARCHAR(40) NOT NULL,
  reviewed BIT NOT NULL DEFAULT 1,
  created_at DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
  PRIMARY KEY(user_id,challenge_date,family_id));
IF COL_LENGTH('dbo.beta_learning_daily_progress','reviewed') IS NULL
 ALTER TABLE dbo.beta_learning_daily_progress ADD reviewed BIT NOT NULL DEFAULT 1;
-- Expand the preference allow-list without touching rows or any database other than AppbassBeta.
DECLARE @preference_check SYSNAME;
SELECT TOP 1 @preference_check=cc.name
FROM sys.check_constraints cc
WHERE cc.parent_object_id=OBJECT_ID('dbo.beta_learning_preferences')
 AND cc.definition LIKE '%section%' AND cc.definition NOT LIKE '%reading%';
IF @preference_check IS NOT NULL
BEGIN
 DECLARE @drop_preference_check NVARCHAR(500)=N'ALTER TABLE dbo.beta_learning_preferences DROP CONSTRAINT '+QUOTENAME(@preference_check);
 EXEC sp_executesql @drop_preference_check;
 ALTER TABLE dbo.beta_learning_preferences ADD CONSTRAINT CK_beta_learning_preferences_section
  CHECK(section IN ('practice','atlas','avatar','session','harmony','reading'));
END;
COMMIT;
