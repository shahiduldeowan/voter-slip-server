const isExcelFileByMimeType = (mimeType) => {
  if (!mimeType) {
    return false;
  }

  return (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-excel"
  );
};

const isZipFileByMimeType = (mimeType) => {
  if (!mimeType) {
    return false;
  }

  const zipMimeTypes = [
    "application/zip",
    "application/x-zip-compressed",
    "multipart/x-zip",
  ];

  return zipMimeTypes.includes(mimeType);
};

const isValidImageByExtension = (extension) => {
  const validExtension = [".jpg", ".jpeg", ".png", ".bmp", ".svg"];
  return validExtension.includes(extension.toString());
};

export { isExcelFileByMimeType, isValidImageByExtension, isZipFileByMimeType };
