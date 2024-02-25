import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const getVersion = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const packageJsonContent = fs.readFileSync(path.resolve(__dirname, "../../package.json"));
    const packageJson = JSON.parse(packageJsonContent);
    const version = packageJson.version;
    return version;
  } catch (error) {
    console.error("Error reading or parsing package.json:", error);
  }
};
