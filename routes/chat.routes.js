import e from "express";
import { authUser } from "../middleware/user_auth_middleware.js";
import {
  accessChat,
  addToGroup,
  createGroupChat,
  fetchChat,
  removeFromGroup,
  renameGroup,
} from "../controller/chatController.js";
const router = e.Router();

router.post("/", authUser, accessChat);
router.get("/", authUser, fetchChat);
router.post("/group", authUser, createGroupChat);
router.put("/rename", authUser, renameGroup);
router.post("/groupremove", authUser, removeFromGroup);
router.post("/groupadd", authUser, addToGroup);

export default router;
