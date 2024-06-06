import fs from "fs";
import path from "path";

const moveFiles = async (sourceDir, targetDir, callback) => {
  let count = 0;
  try {
    const files = await fs.promises.readdir(sourceDir);
    for await (const file of files) {
      const sourceImagePath = path.join(sourceDir, file);
      if (callback(sourceImagePath)) {
        const targetImagePath = path.join(targetDir, file);
        await fs.promises.rename(sourceImagePath, targetImagePath);
        count++;
      } else {
        await fs.promises.rename(sourceImagePath, "public/bin");
      }
    }
  } catch (error) {
    console.log(error.stack);
  }

  return count;
};

export { moveFiles };
