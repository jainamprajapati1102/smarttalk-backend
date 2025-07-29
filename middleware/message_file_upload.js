import multer from "multer";
import fs from "fs";
import path, { join, extname } from "path";
import { fileURLToPath } from "url";

// Equivalent of __filename and __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = join(__dirname, "../uploads");

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
];

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const typeFolder = file.mimetype.split("/")[0]; // 'image', 'audio', etc.
    const uploadPath = join(UPLOAD_DIR, typeFolder);
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const ext = extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image, document, or audio files are allowed!"), false);
  }
};

const MAX_SIZE = 25 * 1024 * 1024;

const msg_file = multer({
  storage: storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: fileFilter,
});

export default msg_file;
