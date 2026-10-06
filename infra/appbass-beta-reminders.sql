IF COL_LENGTH('dbo.beta_users','weekly_study_minutes') IS NULL EXEC('ALTER TABLE dbo.beta_users ADD weekly_study_minutes INT NULL');
IF COL_LENGTH('dbo.beta_users','reminder_day') IS NULL EXEC('ALTER TABLE dbo.beta_users ADD reminder_day TINYINT NULL');
IF COL_LENGTH('dbo.beta_users','last_reminder_at') IS NULL EXEC('ALTER TABLE dbo.beta_users ADD last_reminder_at DATETIME2(3) NULL');
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_beta_users_weekly_minutes') EXEC('ALTER TABLE dbo.beta_users ADD CONSTRAINT CK_beta_users_weekly_minutes CHECK (weekly_study_minutes IS NULL OR weekly_study_minutes BETWEEN 15 AND 1200)');
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_beta_users_reminder_day') EXEC('ALTER TABLE dbo.beta_users ADD CONSTRAINT CK_beta_users_reminder_day CHECK (reminder_day IS NULL OR reminder_day BETWEEN 1 AND 7)');
