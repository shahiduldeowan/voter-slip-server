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

export { isExcelFileByMimeType };
