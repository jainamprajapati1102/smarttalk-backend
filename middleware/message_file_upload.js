// import multer from "multer";
// import fs from "fs";
// import path, { join, extname } from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const UPLOAD_DIR = join(__dirname, "../uploads");

// const allowedMimeTypes = [
//   "image/jpeg",
//   "image/png",
//   "image/webp",
//   "image/gif",
//   "image/svg+xml",
//   "application/pdf",
//   "text/plain",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "audio/mpeg",
//   "audio/wav",
//   "audio/ogg",
//   // Optional: "video/mp4", "video/webm"
// ];

// const ensureDirExists = (dir) => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// };

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const { chatId } = req.body;
//     console.log("frm file middleware-->", req.body);

//     if (!chatId) {
//       return cb(new Error("Chat ID missing"));
//     }

//     const userFolderPath = join(UPLOAD_DIR, `users_${chatId}`);
//     ensureDirExists(userFolderPath);
//     cb(null, userFolderPath);
//   },

//   filename: function (req, file, cb) {
//     const ext = extname(file.originalname);
//     const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
//     cb(null, uniqueName);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only images, documents, or audio files are allowed!"), false);
//   }
// };

// const MAX_SIZE = 25 * 1024 * 1024;

// const msg_file = multer({
//   storage,
//   limits: { fileSize: MAX_SIZE },
//   fileFilter,
// });

// export default msg_file;

// import multer from "multer";
// import multerS3 from "multer-s3";
// import path, { extname } from "path";
// import { s3 } from "../config/s3.js";

// const allowedMimeTypes = [
//   "image/jpeg",
//   "image/png",
//   "image/webp",
//   "image/gif",
//   "image/svg+xml",
//   "application/pdf",
//   "text/plain",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "audio/mpeg",
//   "audio/wav",
//   "audio/ogg",
// ];

// const fileFilter = (req, file, cb) => {
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only images, documents, or audio files are allowed!"), false);
//   }
// };

// const MAX_SIZE = 25 * 1024 * 1024; // 25MB

// const storage = multerS3({
//   s3: s3,
//   bucket: process.env.AWS_BUCKET_NAME,
//   acl: "public-read", // optional: makes uploaded files public

//   key: function (req, file, cb) {
//     const { chatId } = req.body;
//     if (!chatId) return cb(new Error("Chat ID missing"));

//     const ext = extname(file.originalname);
//     const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;

//     // Create folder like users_<chatId> in the bucket
//     const key = `users_${chatId}/${uniqueName}`;
//     cb(null, key);
//   },
// });

// const msg_file = multer({
//   storage,
//   limits: { fileSize: MAX_SIZE },
//   fileFilter,
// });

// export default msg_file;


import multer from "multer";
import multerS3 from "multer-s3";
import path, { extname } from "path";
import { s3 } from "../config/s3Client.js";

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

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images, documents, or audio files are allowed!"), false);
  }
};

const storage = multerS3({
  s3,
  bucket: 'smarttalks',
  // acl: "public-read", // optional (allows public URLs)
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const ext = extname(file.originalname);
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, `chat_uploads/${uniqueName}`);
  },
});

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export const msg_file = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});
