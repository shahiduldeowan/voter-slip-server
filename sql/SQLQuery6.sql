USE VoterSlipDB;


SELECT * FROM T_Users;

SELECT TOP 1 u.UserID, u.Username, [T_Roles].RoleName
FROM T_Users u
INNER JOIN [T_Roles] ON u.RoleID = [T_Roles].RoleID 
WHERE u.Username = 'deowan';

DECLARE @Username NVARCHAR(50);
SET @Username = (SELECT U.Username FROM T_Users AS U WHERE U.Username = 'deowan');
-- PRINT @Username;

SELECT * FROM T_Users;
SELECT * FROM T_Roles;
SELECT TOP 1 'Login successful' AS Message, u.UserID, u.Username, COALESCE(u.FirstName, '') + ' ' + COALESCE(u.LastName, '') AS FullName, u.Avatar, [T_Roles].RoleName
FROM T_Users as u
INNER JOIN [T_Roles] ON u.RoleID = [T_Roles].RoleID 
WHERE u.Username = 'deowan';

TRUNCATE TABLE T_Users;

DELETE FROM T_Users;

INSERT INTO T_Users (Username, Password, Email, FirstName, LastName, RoleID)
VALUES ('deowan', '$2b$10$jJebbOMRmYZXAr40UAiDu.1jv5yMio16pqNgMhYy13XbRQTEGE6h6', NULL, 'Shahidul', 'Deowan', 100000);

INSERT INTO T_Users (Username, Password, Email, FirstName, LastName, RoleID)
VALUES ('sdz', HASHBYTES('SHA2_256', '$2b$10$jJebbOMRmYZXAr40UAiDu.1jv5yMio16pqNgMhYy13XbRQTEGE6h6') , '?', 'Shahidul', 'Deowan', 100000);

ALTER TABLE T_Users
ADD Avatar NVARCHAR(255);

SELECT * FROM T_Voters;

SELECT * FROM T_VotersAudit;

TRUNCATE TABLE T_Voters;
DELETE FROM T_Voters;
DELETE FROM T_VotersAudit;

SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'T_Voters';

ALTER TABLE T_Voters
ADD UpdatedAt DATETIME DEFAULT GETDATE();

SELECT * FROM T_Voters;
select * from T_VotersAudit;

DELETE FROM T_VotersAudit;
DELETE FROM T_Voters;

select * from T_VoterSlips;

SELECT * FROM T_Voters WHERE PhotoURL IS NULL;

SELECT COUNT(*) FROM T_Voters WHERE PhotoURL IS NULL;

SELECT COUNT(*) FROM T_Voters WHERE PhotoURL IS NOT NULL;

select count(*) from T_Voters;


SELECT * FROM T_VoterCounters;

DECLARE @AccountNumber NVARCHAR(25), @GenAcc NVARCHAR(25);
SET @AccountNumber = 'PMA77';

DECLARE @Prefix NVARCHAR(50), @NumberPart NVARCHAR(50)

SET @Prefix = LEFT(@AccountNumber, PATINDEX('%[0-9]%', @AccountNumber + '0') - 1)
SET @NumberPart = SUBSTRING(@AccountNumber, PATINDEX('%[0-9]%', @AccountNumber), LEN(@AccountNumber))

-- Pad the numeric part with leading zeros
SET @NumberPart = RIGHT('0000' + @NumberPart, 6 - LEN(@Prefix))

-- Combine prefix and padded number part
SET @GenAcc = @Prefix + @NumberPart

PRINT @GenAcc;


DECLARE @Input NVARCHAR(25)
SET @Input = '0';
IF (LEN(@Input) = 10 AND @Input NOT LIKE '%[^0-9]%')
BEGIN
	PRINT 'RFID FOUND';
END
ELSE
BEGIN
	PRINT 'RFID NOT FOUND';
END

SELECT * FROM T_Voters where Name = 'Mr. Kamrul Hasan Rahat';
SELECT * FROM T_VoterSlips;
SELECT * FROM T_VotersAudit;
SELECT * FROM T_SlipResets;

DROP TABLE T_VoterSlipAudit;

SELECT * FROM T_Settings;

EXEC sp_VoterSlips_Select 'SLIP_QUEUE';

select * from T_VoterSlips;

select * from T_Users;


WITH VoterSlipCounts AS (
  SELECT
    COUNT(CASE WHEN SlipDetails IN ('ISSUED', 'REISSUE') THEN 1 END) AS IssuedSlips
  FROM T_VoterSlips
),
VotersCounts AS (
  SELECT 
    COUNT(*) AS TotalVoters,
    COUNT(CASE WHEN PhotoURL IS NULL THEN 1 END) AS MissingPhotos
  FROM T_Voters
)


SELECT
  v.TotalVoters,
  vsc.IssuedSlips,
  CAST(vsc.IssuedSlips * 100.0 / v.TotalVoters AS DECIMAL(10,2)) AS IssuedPercentage,
  CAST(v.TotalVoters - vsc.IssuedSlips AS INT) AS PendingVoters,  -- Added missing AS clause
  CAST((v.TotalVoters - vsc.IssuedSlips) * 100.0 / v.TotalVoters AS DECIMAL(10,2)) AS PendingPercentage,  -- Added missing AS clause
  v.MissingPhotos
FROM VoterSlipCounts vsc
INNER JOIN VotersCounts v ON 1=1;

EXEC sp_Voters_Count;

DROP TRIGGER IF EXISTS trg_UpdateVoterSlipReissue;

SELECT COUNT(*) AS COUN FROM T_Voters;
SELECT COUNT(*) AS C FROM T_VoterSlips;

select * from T_VoterSlips;
SELECT * FROM T_Voters where VoterID = 115081;

UPDATE T_VoterSlips
			SET
				SlipDetails = 'REISSUE',
				UpdatedAt = GETDATE()
			WHERE
				VoterID = 113092;

exec sp_VotersSlip_Insert 'LM0001', 113092

SELECT * FROM T_VoterSlipReissues;

SELECT * FROM T_SlipResets;

select * from T_Users;

select * from T_UserLogins;

select * from T_UsersAudit;

SELECT FORMAT (getdate(), 'hh:mm:ss tt') as date

select format(UpdatedAt, 'hh:mm:ss tt') as date
from T_VoterSlips;

SELECT DATEDIFF(
  -- Choose the desired datepart (e.g., second, minute, hour, day, etc.)
  second,
  UpdatedAt,
  GETDATE()
) AS time_difference
FROM T_VoterSlips order by UpdatedAt desc;

SELECT
  DATEDIFF(second, UpdatedAt, GETDATE()) AS seconds_difference,
  DATEDIFF(minute, UpdatedAt, GETDATE()) AS minutes_difference,
  DATEDIFF(hour, UpdatedAt, GETDATE()) AS hours_difference,
  DATEDIFF(day, UpdatedAt, GETDATE()) AS days_difference
FROM T_VoterSlips
ORDER BY UpdatedAt DESC;

SELECT
    CASE
        WHEN DATEDIFF(second, UpdatedAt, GETDATE()) < 60 THEN CAST(DATEDIFF(second, UpdatedAt, GETDATE()) AS VARCHAR(10)) + 's ago'
        WHEN DATEDIFF(minute, UpdatedAt, GETDATE()) < 60 THEN CAST(DATEDIFF(minute, UpdatedAt, GETDATE()) AS VARCHAR(10)) + 'm ago'
        WHEN DATEDIFF(hour, UpdatedAt, GETDATE()) < 24 THEN CAST(DATEDIFF(hour, UpdatedAt, GETDATE()) AS VARCHAR(10)) + 'h ago'
        ELSE CAST(DATEDIFF(day, UpdatedAt, GETDATE()) AS VARCHAR(10)) + 'd ago'
    END AS time_difference
FROM
    T_VoterSlips
ORDER BY
    UpdatedAt DESC;


SELECT
    CASE
        WHEN DATEDIFF(second, UpdatedAt, GETDATE()) < 60 THEN 
            CASE 
                WHEN DATEDIFF(second, UpdatedAt, GETDATE()) = 1 THEN '1 second' 
                ELSE CAST(DATEDIFF(second, UpdatedAt, GETDATE()) AS VARCHAR(10)) + ' seconds' 
            END
        WHEN DATEDIFF(minute, UpdatedAt, GETDATE()) < 60 THEN 
            CASE 
                WHEN DATEDIFF(minute, UpdatedAt, GETDATE()) = 1 THEN '1 minute' 
                ELSE CAST(DATEDIFF(minute, UpdatedAt, GETDATE()) AS VARCHAR(10)) + ' minutes' 
            END
        WHEN DATEDIFF(hour, UpdatedAt, GETDATE()) < 24 THEN 
            CASE 
                WHEN DATEDIFF(hour, UpdatedAt, GETDATE()) = 1 THEN '1 hour' 
                ELSE CAST(DATEDIFF(hour, UpdatedAt, GETDATE()) AS VARCHAR(10)) + ' hours' 
            END
        ELSE 
            CASE 
                WHEN DATEDIFF(day, UpdatedAt, GETDATE()) = 1 THEN '1 day' 
                ELSE CAST(DATEDIFF(day, UpdatedAt, GETDATE()) AS VARCHAR(10)) + ' days' 
            END
    END AS time_difference
FROM
    T_VoterSlips
ORDER BY
    UpdatedAt DESC;



SELECT
    CASE
        WHEN DATEDIFF(second, UpdatedAt, GETDATE()) < 60 THEN 
            CASE 
                WHEN DATEDIFF(second, UpdatedAt, GETDATE()) < 5 THEN 'just now' 
                ELSE CAST(DATEDIFF(second, UpdatedAt, GETDATE()) AS VARCHAR(10)) + 's' 
            END
        WHEN DATEDIFF(minute, UpdatedAt, GETDATE()) < 60 THEN 
            CASE 
                WHEN DATEDIFF(minute, UpdatedAt, GETDATE()) < 2 THEN 'a minute ago' 
                ELSE CAST(DATEDIFF(minute, UpdatedAt, GETDATE()) AS VARCHAR(10)) + 'm' 
            END
        WHEN DATEDIFF(hour, UpdatedAt, GETDATE()) < 24 THEN 
            CASE 
                WHEN DATEDIFF(hour, UpdatedAt, GETDATE()) < 2 THEN 'an hour ago' 
                ELSE CAST(DATEDIFF(hour, UpdatedAt, GETDATE()) AS VARCHAR(10)) + ' hours ago' 
            END
        ELSE 
            CASE 
                WHEN DATEDIFF(day, UpdatedAt, GETDATE()) < 2 THEN 'a day ago' 
                ELSE CAST(DATEDIFF(day, UpdatedAt, GETDATE()) AS VARCHAR(10)) + ' days ago' 
            END
    END AS time_difference
FROM
    T_VoterSlips
ORDER BY
    UpdatedAt DESC;



SELECT
    dbo.FormatTimeDifference(UpdatedAt) AS time_difference
FROM
    T_VoterSlips
ORDER BY
    UpdatedAt DESC;