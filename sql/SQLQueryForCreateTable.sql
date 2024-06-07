CREATE DATABASE VoterSlipDB;

USE VoterSlipDB;

CREATE TABLE T_Roles (
    RoleID INT PRIMARY KEY IDENTITY(100000,1),
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255)
);

INSERT INTO T_Roles (RoleName, Description)
VALUES ('Admin', 'Administrator with full access'),
	   ('Supervisor', 'Supervisor with create, read, write access'),
       ('Operator', 'User with permissions to manage voter slips'),
       ('Viewer', 'User with read-only access');

CREATE TABLE T_Users (
    UserID INT PRIMARY KEY IDENTITY(100000,1),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    Email NVARCHAR(100) NULL,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    RoleID INT FOREIGN KEY REFERENCES T_Roles(RoleID),
    IsActive BIT DEFAULT 1,
	Avatar NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    LastLogin DATETIME,
	SessionID UNIQUEIDENTIFIER NULL,
	IsLoggedIn BIT DEFAULT 0
);

INSERT INTO T_Users (Username, Password, Email, FirstName, LastName, RoleID)
VALUES ('deowan', '$2b$10$jJebbOMRmYZXAr40UAiDu.1jv5yMio16pqNgMhYy13XbRQTEGE6h6', NULL, 'Shahidul', 'Deowan', 100000);

CREATE TABLE T_UsersAudit (
    AuditID INT PRIMARY KEY IDENTITY(100000,1),
    UserID INT NOT NULL FOREIGN KEY REFERENCES T_Users(UserID),
    Action NVARCHAR(50) NOT NULL,
    Details NVARCHAR(MAX),
    PerformedByUserID INT NOT NULL FOREIGN KEY REFERENCES T_Users(UserID),
    PerformedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE T_UserLogins (
    LoginID INT PRIMARY KEY IDENTITY(100000,1),
    UserID INT NOT NULL FOREIGN KEY REFERENCES T_Users(UserID),
	OS NVARCHAR(20) NULL,
	IPAddress NVARCHAR(45),
	SessionID UNIQUEIDENTIFIER NULL,
    LoginTime DATETIME DEFAULT GETDATE(),
    LogoutTime DATETIME,
    CONSTRAINT FK_UserLogins_Users FOREIGN KEY (UserID) REFERENCES T_Users(UserID)
);

CREATE TABLE T_Voters (
    VoterID INT PRIMARY KEY IDENTITY(100000,1),
	SerialNumber INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(15),
    RFID NVARCHAR(50),
    Email NVARCHAR(100),
    DateOfBirth DATE,
    Address NVARCHAR(255),
	AccountNumber NVARCHAR(50) NOT NULL,
	PhotoURL NVARCHAR(255),
    InsertedByUserID INT NOT NULL FOREIGN KEY REFERENCES T_Users(UserID),
    CreatedAt DATETIME DEFAULT GETDATE(),
	UpdatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE T_VotersAudit (
    AuditID INT PRIMARY KEY IDENTITY(100000,1),
	VoterID INT NOT NULL FOREIGN KEY REFERENCES T_Voters(VoterID),
    Action NVARCHAR(50) NOT NULL,
    Details NVARCHAR(MAX),
    PerformedByUserID INT NOT NULL FOREIGN KEY REFERENCES T_Users(UserID),
    PerformedAt DATETIME DEFAULT GETDATE()
);


CREATE TABLE T_VoterSlips (
    SlipID INT PRIMARY KEY IDENTITY(100000,1),
    VoterID INT NOT NULL FOREIGN KEY REFERENCES T_Voters(VoterID),
	SlipDetails NVARCHAR(MAX),
    IssuedByUserID INT NOT NULL FOREIGN KEY REFERENCES T_Users(UserID),
    IssueDate DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE T_SlipResets (
    ResetID INT PRIMARY KEY IDENTITY(100000,1),
    VoterID INT NOT NULL FOREIGN KEY REFERENCES T_Voters(VoterID),
    ResetByUserID INT NOT NULL FOREIGN KEY REFERENCES T_Users(UserID),
    ResetDate DATETIME DEFAULT GETDATE(),
	IssueDate DATETIME NOT NULL,
    PreviousSlipDetails NVARCHAR(MAX),
    Details NVARCHAR(MAX)
);

CREATE TABLE T_VoterSlipReissues (
    ReissueID INT PRIMARY KEY IDENTITY(100000,1),
    SlipID INT NOT NULL,
    ReissuedByUserID INT NOT NULL,
    ReissueDate DATETIME DEFAULT GETDATE(),
    OriginalIssueDate DATETIME,
    OriginalIssuerUserID INT,
    OriginalVoterID INT,
    CONSTRAINT FK_Slip FOREIGN KEY (SlipID) REFERENCES T_VoterSlips(SlipID),
    CONSTRAINT FK_ReissuedByUser FOREIGN KEY (ReissuedByUserID) REFERENCES T_Users(UserID)
);

CREATE TABLE T_VoterCounters (
	CounterID INT PRIMARY KEY IDENTITY(100000, 1),
	StartSerial INT NOT NULL,
	EndSerial INT NOT NULL,
	Counter NVARCHAR(30) NOT NULL,
	InsertedByUserID int NOT NULL FOREIGN KEY REFERENCES T_Users(UserID),
	CreatedAt DATETIME DEFAULT GETDATE(),
	UpdatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE T_ClientInfo (
    ClientID INT PRIMARY KEY IDENTITY(100000,1),
	CreatedByUserID INT FOREIGN KEY REFERENCES T_Users(UserID),
    Name NVARCHAR(100) NOT NULL,
    ContactPerson NVARCHAR(100),
    Email NVARCHAR(255),
    Phone NVARCHAR(20),
    Address NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE(),
	CONSTRAINT CHK_Phone CHECK (Phone LIKE '[0-9]%'),
    CONSTRAINT CHK_Email CHECK (Email LIKE '%_@__%.__%')
);

CREATE INDEX IX_ClientInfo_Email ON T_ClientInfo (Email);

CREATE TABLE T_Settings (
    SettingID INT PRIMARY KEY IDENTITY(100000,1),
    Category NVARCHAR(100) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Value NVARCHAR(MAX) NOT NULL,
    Description NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
	CONSTRAINT UQ_Category_Name UNIQUE (Category, Name)
);

CREATE INDEX IX_Settings_Category ON T_Settings (Category);

INSERT INTO T_Settings (Category, Name, Value, Description)
VALUES 
    ('System', 'Slip Issue Queue', '16', 'Maximum number of slip issue queue allowed');

CREATE TABLE T_SettingsAudit (
    AuditID INT PRIMARY KEY IDENTITY(100000,1),
    SettingID INT NOT NULL FOREIGN KEY REFERENCES T_Settings(SettingID),
    UpdatedByUserID INT NOT NULL FOREIGN KEY REFERENCES T_Users(UserID),
    OldValue NVARCHAR(MAX),
    NewValue NVARCHAR(MAX),
    ChangeDate DATETIME DEFAULT GETDATE()
);

