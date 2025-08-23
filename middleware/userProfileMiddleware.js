import multer from "multer";
import fs from "fs";
import path, { join, extname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = join(__dirname, "../uploads");

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userFolderPath = join(UPLOAD_DIR, `user_profile`);
    ensureDirExists(userFolderPath);
    cb(null, userFolderPath);
  },
  filename: function (req, file, cb) {
    const ext = extname(file.originalname);
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const MAX_SIZE = 25 * 1024 * 1024;

const profilePic = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
});

export default profilePic;
