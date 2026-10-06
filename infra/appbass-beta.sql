CREATE TABLE dbo.beta_users (
  id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_beta_users PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
  email NVARCHAR(320) NOT NULL CONSTRAINT UQ_beta_users_email UNIQUE,
  display_name NVARCHAR(120) NOT NULL,
  password_hash NVARCHAR(300) NOT NULL,
  referred_by UNIQUEIDENTIFIER NULL,
  is_active BIT NOT NULL CONSTRAINT DF_beta_users_active DEFAULT 1,
  created_at DATETIME2(3) NOT NULL CONSTRAINT DF_beta_users_created DEFAULT SYSUTCDATETIME()
);
CREATE TABLE dbo.beta_invite_codes (
  id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_beta_invites PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
  code_hash VARBINARY(32) NOT NULL CONSTRAINT UQ_beta_invites_hash UNIQUE,
  max_uses INT NOT NULL DEFAULT 1,
  uses INT NOT NULL DEFAULT 0,
  expires_at DATETIME2(3) NULL,
  created_at DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE TABLE dbo.beta_sessions (
  token VARCHAR(128) NOT NULL CONSTRAINT PK_beta_sessions PRIMARY KEY,
  user_id UNIQUEIDENTIFIER NOT NULL,
  expires_at DATETIME2(3) NOT NULL,
  created_at DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_beta_sessions_user FOREIGN KEY (user_id) REFERENCES dbo.beta_users(id)
);
CREATE TABLE dbo.beta_progress (
  user_id UNIQUEIDENTIFIER NOT NULL,
  lesson_id NVARCHAR(120) NOT NULL,
  points INT NOT NULL DEFAULT 100,
  completed_at DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_beta_progress PRIMARY KEY (user_id, lesson_id),
  CONSTRAINT FK_beta_progress_user FOREIGN KEY (user_id) REFERENCES dbo.beta_users(id)
);
CREATE TABLE dbo.beta_referrals (
  referrer_id UNIQUEIDENTIFIER NOT NULL,
  referred_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT UQ_beta_referrals_referred UNIQUE,
  created_at DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_beta_referrals PRIMARY KEY (referrer_id, referred_id),
  CONSTRAINT CK_beta_referrals_not_self CHECK (referrer_id<>referred_id)
);
CREATE TABLE dbo.beta_points_ledger (
  id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_beta_points PRIMARY KEY,
  user_id UNIQUEIDENTIFIER NOT NULL,
  amount INT NOT NULL,
  reason NVARCHAR(80) NOT NULL,
  reference NVARCHAR(160) NOT NULL,
  created_at DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_beta_points_reference UNIQUE (user_id, reason, reference),
  CONSTRAINT FK_beta_points_user FOREIGN KEY (user_id) REFERENCES dbo.beta_users(id)
);
