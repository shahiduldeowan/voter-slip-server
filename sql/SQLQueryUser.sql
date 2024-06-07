-- Store Procedure

CREATE PROC sp_Users_Insert
(
	@UserID				INT					=	NULL,
    @Username			NVARCHAR(50)		=	NULL,
    @Password			NVARCHAR(255)		=	NULL,
    @Email				NVARCHAR(100)		=	NULL,
    @FirstName			NVARCHAR(50)		=	NULL,
    @LastName			NVARCHAR(50)		=	NULL,
    @RoleID				INT					=	NULL,
	@Avatar				NVARCHAR(255)		=	NULL
)
AS
BEGIN
	IF (@UserID IS NULL)
	BEGIN
		RAISERROR('User id required', 16, 1);
		RETURN;
	END

	-- Register user
	INSERT INTO T_Users
	(
		Username,
		Password,
		Email,
		FirstName,
		LastName,
		RoleID,
		Avatar
	)
	VALUES
	(
		LOWER(@Username),
		@Password,
		@Email,
		@FirstName,
		@LastName,
		@RoleID,
		@Avatar
	)

	DECLARE @InsertUserID INT
	SET @InsertUserID = COALESCE((SELECT UserID FROM  T_Users WHERE Username = LOWER(@Username)), SCOPE_IDENTITY())

	-- Register the action
	INSERT INTO T_UsersAudit
	(
		UserID, 
		Action, 
		Details, 
		PerformedByUserID
	)
	VALUES
	(
		@InsertUserID,
		'Register', 
		'Register user',
		@UserID
	);

	SELECT @InsertUserID AS UserID;
END

-- User login
CREATE PROC sp_Users_Login
(
	@ActionName			NVARCHAR(256)		=	NULL
	,@Username			NVARCHAR(50)		=	NULL
	,@OS				NVARCHAR(20)		=	NULL
	,@IPAddress			NVARCHAR(45)		=	NULL
)
AS
BEGIN
	SET NOCOUNT ON;

	-- Validate input parameters
	IF (@ActionName IS NULL OR @Username IS NULL)
	BEGIN
		RAISERROR ('Invalid parameters', 16, 1);
		RETURN;
	END

	-- handle USER_FIND action
	ELSE IF (@ActionName = 'USER_FIND')
	BEGIN
		DECLARE @Password NVARCHAR(255);

		SELECT @Password = U.Password
		FROM T_Users AS U 
		WHERE U.Username = @Username;

		IF (@Password IS NULL)
		BEGIN
			SELECT 'User not found' AS Message;
		END
		ELSE
		BEGIN
			SELECT 'User found' AS Message, @Password AS Password;
		END
		RETURN;
	END

	-- handle USER_LOGIN action
	ELSE IF (@ActionName = 'USER_LOGIN')
	BEGIN
		BEGIN TRY
			-- Check if the user exists
			IF NOT EXISTS (SELECT 1 FROM T_Users WHERE Username = @Username)
			BEGIN
				SELECT 'User not found' AS Message;
				RETURN;
			END

			DECLARE @UserID INT;
			DECLARE @NewSessionID UNIQUEIDENTIFIER = NEWID();

			SELECT @UserID = U.UserID 
			FROM T_Users AS U 
			WHERE U.Username = @Username;

			BEGIN TRANSACTION;

			-- Logout any existing sessions
			UPDATE T_Users
			SET 
				SessionID = null,
				IsLoggedIn = 0
			WHERE UserID = @UserID;

			-- Update user login details
			UPDATE T_Users
			SET
				UpdatedAt = GETDATE(),
				LastLogin = GETDATE(),
				SessionID = @NewSessionID,
				IsLoggedIn = 1
			WHERE Username = @Username;

			-- Log the action
			INSERT INTO T_UsersAudit(UserID, Action, Details, PerformedByUserID)
			VALUES(@UserID, 'Modify', 'Update user login time', @UserID);

			-- Insert into login history
			INSERT INTO T_UserLogins (UserID, LoginTime, OS, IPAddress, SessionID)
			VALUES(@UserID, GETDATE(), @OS, @IPAddress, @NewSessionID);

			COMMIT TRANSACTION;

			-- Return user details
			SELECT TOP 1 
				'Login successful' AS Message
				,u.UserID
				,u.Username
				,COALESCE(u.FirstName, '') + ' ' + COALESCE(u.LastName, '') AS FullName
				,u.Email
				,u.Avatar
				,[T_Roles].RoleName
				,[T_Roles].Description
				,U.LastLogin
				,@NewSessionID AS SessionID
			FROM T_Users AS u
			INNER JOIN [T_Roles] ON u.RoleID = [T_Roles].RoleID 
			WHERE u.Username = @Username AND u.UserID = @UserID;
		END TRY
		BEGIN CATCH
		ROLLBACK TRANSACTION;
			DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
			RAISERROR (@ErrorMessage, 16, 1);
		END CATCH

		RETURN;
	END
END;


CREATE PROC sp_Users_SEL
(
	@ActionName		NVARCHAR(256)		=	NULL
	,@UserID		INT					=	NULL
	,@Username			NVARCHAR(50)	=	NULL
)
AS
BEGIN
	IF (@ActionName = 'GET')
	BEGIN
		IF NOT EXISTS(SELECT 1 FROM T_Users WHERE UserID = @UserID)
		BEGIN
			RAISERROR('User not found', 16, 1);
			RETURN;
		END
		-- Return user details
		SELECT TOP 1
		U.UserID
		,U.Username
		,COALESCE(U.FirstName, '') + ' ' + COALESCE(U.LastName, '') AS FullName
		,U.Email
		,U.Avatar
		,[T_Roles].RoleName
		,[T_Roles].Description
		,U.LastLogin
		,U.SessionID
		FROM T_Users AS U
		INNER JOIN [T_Roles] ON [T_Roles].RoleID = U.RoleID
		WHERE U.UserID = @UserID;
	END;
	ELSE IF (@ActionName = 'GET_ALL_USERS')
	BEGIN
		-- Return all user and details
		SELECT
		U.UserID
		,U.Username
		,COALESCE(U.FirstName, '') + ' ' + COALESCE(U.LastName, '') AS FullName
		,U.FirstName
		,U.LastName
		,U.Email
		,U.Avatar
		,[T_Roles].RoleName
		,[T_Roles].Description
		,U.LastLogin
		FROM T_Users AS U
		INNER JOIN [T_Roles] ON [T_Roles].RoleID = U.RoleID;
	END
	ELSE IF (@ActionName = 'IS_USER_EXIST')
	BEGIN
		IF EXISTS(SELECT 1 FROM T_Users WHERE LOWER(Username) = LOWER(@Username))
			BEGIN
				SELECT 1 AS IsUserExist;
			END
		ELSE
			BEGIN
				SELECT 0 AS IsUserExist;
			END
	END
END;


CREATE PROC sp_Users_Logout
(
	@UserID			INT					=	NULL
	,@SessionID UNIQUEIDENTIFIER		=	NULL
)
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		BEGIN TRANSACTION

		--UPDATE T_Users
		--SET SessionID	= NULL,
			--IsLoggedIn	= 0,
			--UpdatedAt	= GETDATE()
		--WHERE UserID = @UserID;

		-- Log the action
		--INSERT INTO T_UsersAudit(UserID, Action, Details, PerformedByUserID)
		--VALUES(@UserID, 'Modify', 'Update SessionID, IsLoggedIn to logout', @UserID);

		-- Update logout time
		UPDATE T_UserLogins
		SET LogoutTime = GETDATE()
		WHERE UserID = @UserID AND SessionID = @SessionID;

		COMMIT TRANSACTION

		SELECT 'Logout successful' AS Message;
	END TRY
	BEGIN CATCH
	ROLLBACK TRANSACTION;
	DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
	RAISERROR (@ErrorMessage, 16, 1);
	END CATCH;
END;

CREATE PROC sp_Voters_Insert
(
	@SerialNumber INT = NULL,
    @Name NVARCHAR(100) = NULL,
    @PhoneNumber NVARCHAR(15) = NULL,
    @RFID NVARCHAR(50) = NULL,
    @Email NVARCHAR(100) = NULL,
    @DateOfBirth DATE = NULL,
    @Address NVARCHAR(255) = NULL,
	@AccountNumber NVARCHAR(50) = NULL,
	@PhotoURL NVARCHAR(255) = NULL,
    @InsertedByUserID INT = NULL
)
AS
BEGIN
	BEGIN TRY
		DECLARE @VoterID INT;

		BEGIN TRANSACTION

			INSERT INTO T_Voters 
			(	SerialNumber, 
				Name, 
				PhoneNumber, 
				RFID, 
				Email, 
				DateOfBirth, 
				Address, 
				AccountNumber,
				PhotoURL,
				InsertedByUserID
			)
			VALUES
			(
				@SerialNumber,
				@Name,
				@PhoneNumber,
				@RFID,
				@Email,
				@DateOfBirth,
				@Address,
				@AccountNumber,
				@PhotoURL,
				@InsertedByUserID
			);

			SET @VoterID = SCOPE_IDENTITY();

			INSERT INTO T_VotersAudit
			(
				VoterID,
				Action,
				Details,
				PerformedByUserID
			)
			VALUES
			(
				@VoterID,
				'Create',
				'Created voter',
				@InsertedByUserID
			);

		COMMIT TRANSACTION

		SELECT 'Voter created successful' AS Message;
	END TRY
	BEGIN CATCH
		ROLLBACK TRANSACTION;
		DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
		RAISERROR(@ErrorMessage, 16, 1);
	END CATCH
END;

CREATE PROC sp_Voters_Select
(
	@ActionName NVARCHAR(256) = NULL,
	@Query NVARCHAR(250) = NULL
)
AS
BEGIN
	IF (@ActionName IS NULL)
	BEGIN
		RAISERROR('Action name required', 16, 1);
		RETURN;
	END;
	IF (@ActionName = 'GET')
	BEGIN
		SELECT
			V.VoterID,
			V.SerialNumber,
			V.Name,
			V.PhoneNumber,
			V.Email,
			V.AccountNumber,
			V.PhotoURL,
			IU.Username AS CreatedByUser,
			V.CreatedAt AS VoterCreatedAt,
			VS.IssueDate AS IssuedAt,
			CASE
				WHEN VS.SlipID IS NOT NULL AND VS.SlipDetails = 'ISSUED' OR VS.SlipDetails = 'REISSUE' THEN 'Issued'
				ELSE 'Pending'
			END AS SlipStatus,
			U.Username AS Issuer
		FROM
			T_Voters AS V
		LEFT JOIN
			T_VoterSlips AS VS ON V.VoterID = VS.VoterID
		LEFT JOIN
			T_Users AS U ON U.UserID = VS.IssuedByUserID
		LEFT JOIN
			T_Users AS IU ON V.InsertedByUserID = IU.UserID;
	END;
	ELSE IF (@ActionName = 'FIND_ONE')
	BEGIN
		DECLARE @BuildQuery NVARCHAR(25)

		-- Check query is rfid
		IF (LEN(@Query) = 10 AND @Query NOT LIKE '%[^0-9]%')
		BEGIN
			SET @BuildQuery = @Query
		END
		-- if query length less than 6 then its account number and build rebuild account and doing length 6 
		ELSE IF (LEN(@Query) < 6)
		BEGIN
			DECLARE @Letter NVARCHAR(10), @Number NVARCHAR(10)
			SET @Letter = LEFT(@Query, PATINDEX('%[0-9]%', @Query + '0') - 1)
			SET @Number = SUBSTRING(@Query, PATINDEX('%[0-9]%', @Query), LEN(@Query))
			-- Pad the numeric part with leading zeros
			SET @Number = RIGHT('0000' + @Number, 6 - LEN(@Letter))
			-- Combine letter and number
			SET @BuildQuery = @Letter + @Number;
		END
		ELSE
		BEGIN
			SET @BuildQuery = @Query;
		END

		SELECT TOP (1)
			V.Name,
			V.AccountNumber,
			V.SerialNumber,
			V.PhotoURL,
			CASE
				WHEN VS.SlipID IS NOT NULL AND VS.SlipDetails = 'ISSUED' OR VS.SlipDetails = 'REISSUE' THEN 'Issued'
				ELSE 'Pending'
			END AS SlipStatus,
			COALESCE(VC.Counter, 1) AS CounterNumber
		FROM 
			T_Voters AS V
		LEFT JOIN 
			T_VoterSlips AS VS ON V.VoterID = VS.VoterID
		LEFT JOIN
			T_VoterCounters VC ON V.SerialNumber BETWEEN VC.StartSerial AND VC.EndSerial
		WHERE
			LOWER(V.AccountNumber) = LOWER(@BuildQuery) OR V.RFID = @BuildQuery;
	END;
END;


CREATE PROCEDURE sp_Voters_Update
(
    @ActionName NVARCHAR(250),
    @UserID INT,
    @AccountNumber NVARCHAR(50),
    @PhotoURL NVARCHAR(255)
)
AS
BEGIN
    -- Validate mandatory inputs
    IF @ActionName IS NULL OR @UserID IS NULL OR @AccountNumber IS NULL
    BEGIN
        RAISERROR('Action name, User ID, and Account Number are required.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        -- Process based on ActionName
        IF (@ActionName = 'UPDATE_PHOTO_URL')
        BEGIN
            DECLARE @VoterID INT;

            BEGIN TRANSACTION;

            -- Update Photo URL, keeping previous value if @PhotoURL is NULL
            UPDATE T_Voters
            SET 
				PhotoURL = COALESCE(@PhotoURL, PhotoURL),
				UpdatedAt = GETDATE()
            WHERE LOWER(AccountNumber) = LOWER(@AccountNumber);

            -- Retrieve updated VoterID
            SET @VoterID = (SELECT VoterID FROM T_Voters WHERE LOWER(AccountNumber) = LOWER(@AccountNumber));

            -- Check if update was successful
            IF @VoterID IS NULL
            BEGIN
                ROLLBACK TRANSACTION;
                RAISERROR('Voter not found!', 16, 1);
                RETURN;
            END

            -- Insert into T_VotersAudit
            INSERT INTO T_VotersAudit
            (
                VoterID,
                Action,
                Details,
                PerformedByUserID
            )
            VALUES
            (
                @VoterID,
                'Modify',
                'Updated photo URL',
                @UserID
            );

            COMMIT TRANSACTION;

            SELECT 'Update successful' AS Message;
        END
        ELSE
        BEGIN
            RAISERROR('Invalid action name.', 16, 1);
            RETURN;
        END
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;


CREATE PROC sp_VotersSlip_Insert
(
	@AccountNumber NVARCHAR(50) = NULL,
	@UserID INT = NULL,
	@SlipDetails NVARCHAR(50) = NULL
)
AS
BEGIN
	BEGIN TRY
		DECLARE @VoterID INT;
		SET @VoterID = (SELECT V.VoterID FROM T_Voters AS V WHERE LOWER(V.AccountNumber) = LOWER(@AccountNumber))

		IF (@VoterID IS NULL)
		BEGIN
			SELECT 'Voter not found' AS Message;
			RETURN;
		END

		DECLARE @VoterIDFromVoterSlip INT, @SlipDetailsFromVoterSlip NVARCHAR(50);

		SElECT 
			@VoterIDFromVoterSlip = VS.VoterID,
			@SlipDetailsFromVoterSlip = VS.SlipDetails
			FROM T_VoterSlips AS VS 
			WHERE 
				@VoterID = VS.VoterID;

		IF (@VoterIDFromVoterSlip IS NULL)
		BEGIN
			INSERT INTO T_VoterSlips(VoterID, IssuedByUserID, SlipDetails)
			VALUES(@VoterID, @UserID, 'ISSUED')

			SELECT TOP(1)
				V.AccountNumber
			FROM T_Voters AS V
			WHERE V.VoterID = @VoterID
			RETURN
		END

		ELSE IF (@VoterIDFromVoterSlip IS NOT NULL AND @SlipDetailsFromVoterSlip IS NOT NULL AND @SlipDetailsFromVoterSlip = 'RESET')
		BEGIN
			DECLARE 
				@SlipID INT,
				@OriginalIssueDate DATETIME, 
                @OriginalIssuerUserID INT;

			SELECT 
				@SlipID = VS.SlipID,
				@OriginalIssueDate = VS.IssueDate,
				@OriginalIssuerUserID = VS.IssuedByUserID
			FROM T_VoterSlips AS VS 
			WHERE VS.VoterID = @VoterID;
				

			UPDATE T_VoterSlips
			SET
				SlipDetails = 'REISSUE',
				UpdatedAt = GETDATE()
			WHERE
				VoterID = @VoterID;

			-- Insert the reissue details into T_VoterSlipReissues
            INSERT INTO T_VoterSlipReissues
            (
                SlipID, 
                ReissuedByUserID, 
                ReissueDate, 
                OriginalIssueDate, 
                OriginalIssuerUserID, 
                OriginalVoterID
            )
            VALUES
            (
                @SlipID, 
                @UserID, 
                GETDATE(), 
                @OriginalIssueDate, 
                @OriginalIssuerUserID, 
                @VoterID
            );

			SELECT TOP(1)
				V.AccountNumber
			FROM T_Voters AS V
			WHERE V.VoterID = @VoterID
			RETURN
		END
		ELSE
		BEGIN
			SELECT 'Something went wrong' AS Message;
		END
	END TRY
	BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
	END CATCH
END

-- Update voter slip
CREATE PROC sp_VotersSlip_Update
(
    @ActionName NVARCHAR(250) = NULL,
    @UserID INT,
	@VoterID INT
)
AS
BEGIN
	IF (@ActionName IS NULL)
	BEGIN
		RAISERROR('Action name required', 16, 1);
		RETURN;
	END
	BEGIN TRY
		IF (@ActionName = 'SLIP_RESET')
		BEGIN
			BEGIN TRANSACTION
				DECLARE 
					@IssueDate DATETIME,
					@PreviousSlipDetails NVARCHAR(MAX);

				SELECT TOP(1)
					@IssueDate = VS.IssueDate,
					@PreviousSlipDetails = VS.SlipDetails
				FROM T_VoterSlips AS VS
				WHERE
					@VoterID = VS.VoterID;

				UPDATE T_VoterSlips
				SET 
					SlipDetails = 'RESET',
					UpdatedAt = GETDATE()
				WHERE
					@VoterID = VoterID;
				
				INSERT INTO T_SlipResets
				(
					VoterID,
					ResetByUserID,
					IssueDate,
					PreviousSlipDetails,
					Details
				)
				VALUES
				(
					@VoterID,
					@UserID,
					@IssueDate,
					@PreviousSlipDetails,
					'RESET'
				);
			COMMIT TRANSACTION;

			SELECT @VoterID AS VoterID;
		END
	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
	END CATCH
END

CREATE PROC sp_VoterSlips_Select
(
	@ActionName NVARCHAR(250) = NULL
)
AS
BEGIN
	IF (@ActionName IS NULL)
	BEGIN
		RAISERROR('Action name required', 16, 1)
		RETURN
	END

	BEGIN TRY
		IF (@ActionName = 'SLIP_QUEUE')
		BEGIN
			;WITH QueueLength AS (
				SELECT ISNULL(CAST(S.Value AS INT), 10) AS QueueLength
				FROM T_Settings AS S 
				WHERE S.Category = 'System' AND S.Name = 'Slip Issue Queue'
			)

			SELECT
				V.Name,
				V.AccountNumber,
				V.PhotoURL,
				VC.Counter,
				dbo.FormatTimeDifference(VS.UpdatedAt) AS IssueDate
			FROM 
				T_VoterSlips AS VS
			INNER JOIN 
				T_Voters AS V ON VS.VoterID = V.VoterID
			INNER JOIN
				T_VoterCounters VC ON V.SerialNumber BETWEEN VC.StartSerial AND VC.EndSerial
			WHERE
				VS.SlipDetails = 'ISSUED' OR VS.SlipDetails = 'REISSUE'
			ORDER BY VS.UpdatedAt DESC
			OFFSET 0 ROWS FETCH NEXT (SELECT QueueLength FROM QueueLength) ROWS ONLY;
		END
	END TRY
	BEGIN CATCH
		DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
	END CATCH
END


CREATE PROC sp_Voters_Count
AS
BEGIN
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
		CAST(v.TotalVoters - vsc.IssuedSlips AS INT) AS PendingVoters,
		CAST((v.TotalVoters - vsc.IssuedSlips) * 100.0 / v.TotalVoters AS DECIMAL(10,2)) AS PendingPercentage,
		v.MissingPhotos
	FROM VoterSlipCounts vsc
	INNER JOIN VotersCounts v ON 1=1;
END


CREATE PROC sp_Roles_Select
AS
BEGIN
	SELECT * FROM T_Roles;
END

-- Create Function
CREATE FUNCTION FormatTimeDifference
(
    @UpdatedAt DATETIME
)
RETURNS NVARCHAR(100)
AS
BEGIN
    DECLARE @TimeDifference NVARCHAR(100);

    SELECT @TimeDifference = 
        CASE
            WHEN DATEDIFF(second, @UpdatedAt, GETDATE()) < 60 THEN 
                CASE 
                    WHEN DATEDIFF(second, @UpdatedAt, GETDATE()) < 5 THEN 'just now' 
                    ELSE CAST(DATEDIFF(second, @UpdatedAt, GETDATE()) AS VARCHAR(10)) + 's' 
                END
            WHEN DATEDIFF(minute, @UpdatedAt, GETDATE()) < 60 THEN 
                CASE 
                    WHEN DATEDIFF(minute, @UpdatedAt, GETDATE()) < 2 THEN 'a minute ago' 
                    ELSE CAST(DATEDIFF(minute, @UpdatedAt, GETDATE()) AS VARCHAR(10)) + ' minutes ago' 
                END
            WHEN DATEDIFF(hour, @UpdatedAt, GETDATE()) < 24 THEN 
                CASE 
                    WHEN DATEDIFF(hour, @UpdatedAt, GETDATE()) < 2 THEN 'an hour ago' 
                    ELSE CAST(DATEDIFF(hour, @UpdatedAt, GETDATE()) AS VARCHAR(10)) + ' hours ago' 
                END
            ELSE 
                CASE 
                    WHEN DATEDIFF(day, @UpdatedAt, GETDATE()) < 2 THEN 'a day ago' 
                    ELSE CAST(DATEDIFF(day, @UpdatedAt, GETDATE()) AS VARCHAR(10)) + ' days ago' 
                END
        END;

    RETURN @TimeDifference;
END;


--CREATE PROC sp_VoterCounters_Select


--select * from T_VoterCounters;