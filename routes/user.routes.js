import e from "express";
import {
  authCheck,
  logout,
  search_user,
  signin,
  signup,
  allUser,
  update_user_data,
} from "../controller/userController.js";
import { body } from "express-validator";
import { authUser } from "../middleware/user_auth_middleware.js";
import profilePic from "../middleware/userProfileMiddleware.js";
const router = e.Router();

router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Please Provide Name"),
    body("mobile")
      .isLength({ min: 10, max: 10 })
      .withMessage("mobile number length must be 10 digit long"),
  ],
  profilePic.single("profilePic"),
  signup
);

router.post("/signin", signin);
router.post("/logout", authUser, logout);
router.get("/authCheck", authUser, authCheck);
router.post("/search_user", authUser, search_user);
router.post("/edit_user", authUser, update_user_data);
router.get("/alluser", allUser);
export default router;
