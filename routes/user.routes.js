import e from "express";
import {
  getMe,
  logout,
  search_user,
  signin,
  signup,
} from "../controller/userController.js";
import { body } from "express-validator";
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
router.post("/logout", logout);
router.get("/me", getMe);
router.post("/search_user", search_user);
export default router;
