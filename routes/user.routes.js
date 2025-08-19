import e from "express";
import {
  authCheck,
  logout,
  search_user,
  signin,
  signup,
} from "../controller/userController.js";
import { body } from "express-validator";
import { authUser } from "../middleware/user_auth_middleware.js";
const router = e.Router();

router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Please Provide Name"),
    body("mobile")
      .isLength({ min: 10, max: 10 })
      .withMessage("mobile number length must be 10 digit long"),
  ],
  signup
);

router.post("/signin", signin);
router.post("/logout", authUser, logout);
router.get("/authCheck", authUser, authCheck);
router.post("/search_user", authUser, search_user);
export default router;
