import e from "express";
import { body } from "express-validator";
import {
  // exist_msg,
  message_create,
  msg_seen,
  allMessage,
  msg_delete_me,
  msg_delete_all,
} from "../controller/messageController.js";
import msg_file from "../middleware/message_file_upload.js";
import { authUser } from "../middleware/user_auth_middleware.js";
const router = e.Router();

router.post(
  "/create_message",
  [body("chatId").notEmpty().withMessage("chatId is always defined")],
  authUser,
  msg_file.single("attachments"),
  message_create
);
router.get("/:chatId", authUser, allMessage);
router.post("/msg_seen", authUser, msg_seen);
router.post(
  "/msg_delete_me",
  [
    body("msg_id").notEmpty().withMessage("msg id not empty"),
    body("chat_id").notEmpty().withMessage("msg id not empty"),
  ],
  authUser,
  msg_delete_me
);
router.post("/msg_delete_all", authUser, msg_delete_all);

export default router;
