import e from "express";
import { body } from "express-validator";
import {
  exist_msg,
  message_create,
  msg_seen,
  selectedUser_msg,
  msg_delete_me,
  msg_delete_all,
} from "../controller/messageController.js";
const router = e.Router();

router.post(
  "/create_chat",
  [
    body("receiver_id").notEmpty().withMessage("receiver is always defined"),
    body("sender_id").notEmpty().withMessage("sender is always defined"),
  ],
  message_create
);
router.post("/selectedUser_msg", selectedUser_msg);
router.post("/exist_msg", exist_msg);
router.post("/msg_seen", msg_seen);
router.post(
  "/msg_delete_me",
  [
    body("id").notEmpty().withMessage("Sender id not empty"),
    body("login_id").notEmpty().withMessage("login user id not empty"),
    body("msg_id").notEmpty().withMessage("msg id not empty"),
  ],
  msg_delete_me
);
router.post("/msg_delete_all", msg_delete_all);

export default router;
