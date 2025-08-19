import multer from "multer";
import fs from "fs";
import path, { join, extname } from "path";
import { fileURLToPath } from "url";

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
  // Optional: "video/mp4", "video/webm"
];

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { chatId } = req.body;
    console.log("frm file middleware-->", req.body);

    if (!chatId) {
      return cb(new Error("Chat ID missing"));
    }

    const userFolderPath = join(UPLOAD_DIR, `users_${chatId}`);
    ensureDirExists(userFolderPath);
    cb(null, userFolderPath);
  },

  filename: function (req, file, cb) {
    const ext = extname(file.originalname);
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images, documents, or audio files are allowed!"), false);
  }
};

const MAX_SIZE = 25 * 1024 * 1024;

const msg_file = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

export default msg_file;
