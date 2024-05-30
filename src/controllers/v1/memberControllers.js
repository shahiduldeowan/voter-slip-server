import decompress from "decompress";
import fs from "fs";
import XLSX from "xlsx";
import { logger } from "../../config/logConfig.js";
import {
  onCreateMember,
  onSelectMembers,
  onUpdateMemberPhotoURL,
} from "../../models/v1/memberModels.js";
import { ApiJsonError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  isExcelFileByMimeType,
  isZipFileByMimeType,
} from "../../utils/checkFileType.js";

const uploadMembers = async (req, res) => {
  try {
    const filePath = req.file?.path;
    if (!filePath) {
      return res
        .status(400)
        .json(new ApiJsonError(400, "Uploading members failed"));
    }

    if (!isExcelFileByMimeType(req.file?.mimetype)) {
      fs.unlinkSync(filePath);
      return res
        .status(400)
        .json(new ApiJsonError(400, "Only excel files are allowed"));
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data) {
      return res
        .status(400)
        .json(new ApiJsonError(400, "Members inset failed"));
    }

    if (data.length <= 0) {
      return res.status(400).json(new ApiJsonError(400, "Member not found"));
    }

    let count = 0;
    data.sort((a, b) => a["Sl #"] - b["Sl #"]);
    for (let row of data) {
      try {
        await onCreateMember(row, req.user?.UserID);
        count++;
      } catch (error) {
        console.log(`ERROR: ${error.message}`);
      }
    }

    fs.unlinkSync(filePath);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          created: count,
        },
        "Members successfully uploaded"
      )
    );
  } catch (error) {
    logger.error(error.message);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

const getMembers = async (req, res) => {
  try {
    const members = await onSelectMembers();
    res.status(200).json(new ApiResponse(200, members, "Members successfully"));
  } catch (error) {
    logger.error(`ERROR: ${error.message}`);
    console.log(error.stack);
    res
      .status(error.status || 500)
      .json(
        new ApiJsonError(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const uploadMembersImagesZipFile = async (req, res) => {
  try {
    const zipFilePath = req.file?.path;
    if (!zipFilePath) {
      return res.status(400).json(new ApiJsonError(400, "Bad request"));
    }

    if (!isZipFileByMimeType(req.file?.mimetype)) {
      fs.unlinkSync(zipFilePath);
      return res
        .status(400)
        .json(new ApiJsonError(400, "Only zip file are allowed"));
    }

    const extractPath = "public/images";
    const imageFiles = await decompress(zipFilePath, extractPath);
    await fs.promises.unlink(zipFilePath);

    let count = 0;
    for (const imageFile of imageFiles) {
      const imageFilePath = imageFile?.path;
      if (imageFilePath) {
        try {
          await onUpdateMemberPhotoURL(imageFilePath, req.user?.UserID);
          count++;
        } catch (error) {
          console.log(error.stack);
        }
      }
    }
    logger.info(`Uploading ${count} images from ${zipFilePath}`);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          updated: count,
        },
        "Members images successfully uploaded"
      )
    );
  } catch (error) {
    logger.error(error.message);
    console.log(error.stack);
    res
      .status(error.status || 500)
      .json(
        new ApiJsonError(
          error.status || 500,
          error.message || "Internal server error!"
        )
      );
  }
};

export { getMembers, uploadMembers, uploadMembersImagesZipFile };

/*
imageFiles:
{
    mode: 420,
    mtime: 2023-06-21T12:29:10.000Z,
    path: 'DCL_Photos/LM0272.jpg',
    type: 'file',
    data: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 02 01 01 2c 01 2c 00 00 ff e1 17 67 45 78 69 66 00 00 49 49 2a 00 08 00 00 00 0a 00 0f 01 02 00 06 00 00 00 86 00 ... 169394 more bytes>
  },

*/
