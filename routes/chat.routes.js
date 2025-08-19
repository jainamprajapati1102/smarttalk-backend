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
router.put("/groupremove", authUser, removeFromGroup);
router.post("/groupadd", authUser, addToGroup);
// router.get("/fetchChat", authUser, fetchChat);

export default router;
