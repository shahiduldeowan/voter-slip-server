import { DB_ACTIONS } from "../../constants.js";
import { poolPromise } from "../../db/index.js";
import { getServerIP } from "../../utils/serverInfo.js";

// Get image name from path after unzip
const getVoterIDByImageFilePath = (filePath) => {
  if (!filePath) {
    return null;
  }

  const parts = filePath.split("/");
  const filenameWithExt = parts[parts.length - 1];
  const filename = filenameWithExt.substring(
    0,
    filenameWithExt.lastIndexOf(".")
  );
  return filename;
};

const onCreateMember = async (member, userID) => {
  try {
    const request = await poolPromise
      .request()
      .input("SerialNumber", member["Sl #"])
      .input("Name", member["Name"])
      .input("PhoneNumber", member["Mobile"])
      .input("RFID", member["RFID"])
      .input("Email", member["Email"])
      .input("AccountNumber", member["A/C #"])
      .input("InsertedByUserID", userID)
      .execute("dbo.sp_Voters_Insert");

    return request.recordset;
  } catch (error) {
    throw error;
  }
};

const onSelectMembers = async () => {
  try {
    const request = await poolPromise
      .request()
      .input("ActionName", DB_ACTIONS.GET)
      .execute("dbo.sp_Voters_Select");

    const members = request.recordset;
    if (members && members.length > 0) {
      const serverIP = getServerIP();
      const port = process.env.PORT || 8000;

      const newMembers = members.map((member) => {
        const photoURL = member.PhotoURL;
        const genPhotoURL = photoURL
          ? `http://${serverIP}:${port}/${photoURL}`
          : photoURL;

        return {
          VoterID: member.VoterID,
          SerialNumber: member.SerialNumber,
          Name: member.Name,
          PhoneNumber: member.PhoneNumber,
          Email: member.Email,
          AccountNumber: member.AccountNumber,
          PhotoURL: genPhotoURL,
          CreatedByUser: member.CreatedByUser,
          VoterCreatedAt: member.VoterCreatedAt,
          IssuedAt: member.IssuedAt,
          SlipStatus: member.SlipStatus,
          Issuer: member.Issuer,
        };
      });

      return newMembers;
    }

    return members;
  } catch (error) {
    throw error;
  }
};

const onUpdateMemberPhotoURL = async (photoURL, userID) => {
  try {
    const voterID = getVoterIDByImageFilePath(photoURL);
    if (!voterID) {
      return;
    }

    const request = await poolPromise
      .request()
      .input("ActionName", DB_ACTIONS.UPDATE_PHOTO_URL)
      .input("AccountNumber", voterID)
      .input("UserID", userID)
      .input("PhotoURL", `images/${photoURL}`)
      .execute("dbo.sp_Voters_Update");

    return request.recordset;
  } catch (error) {
    throw error;
  }
};

export { onCreateMember, onSelectMembers, onUpdateMemberPhotoURL };
