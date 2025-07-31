import { validationResult } from "express-validator";
import { createUser } from "../service/user.service.js";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const signup = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body is empty" });
    }

    const error = validationResult(req);
    const { name, mobile } = req.body;

    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    // const hashPass = await userModel.hashedPassword(password);
    const chqMatch = await userModel.findOne({ mobile });
    if (chqMatch) {
      return res.status(300).json({ msg: "Mobile has already register" });
    }
    const user = await createUser({ name, mobile });
    const token = await user.generateToken();

    res.status(200).json({ user, token });
    // res.end();
  } catch (error) {
    console.log(error);
  }
};

export const signin = async (req, res) => {
  try {
    const { mobile } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await userModel.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ msg: "Invalid mobile or Password" });
    }

    // const isMatch = user.comparePassword(password);
    // if (!isMatch) {
    //   return res.status(401).json({ message: "Invalid mobile and password" });
    // }
    const token = await user.generateToken();
    if (token) {
      res
        .status(200)
        .cookie("token", token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production", // true in production
          sameSite: "Lax", // or "Strict"
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        })
        .json({ msg: "Login successful", user, token: token });
      // res.end();
    } else {
      res.send("Token not generate");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// in userController.js
export const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    // console.log(token);

    if (!token) return res.status(401).json({ msg: "Not Authenticated" });

    const decoded = jwt.verify(token, "sm?>{}+arttal!_&&*k?@s"); //process.env.JWT_SECRET);
    console.log(decoded._id);
    if (decoded._id) {
      const user = await userModel.findById(decoded._id).select("-password");
      res.json({ user });
    }
  } catch (error) {
    // console.log(error);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ msg: "Logged out" });
};

export const search_user = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (mobile) {
      let keyword = mobile.trim();
      const find_user = await userModel.find({
        $or: [{ mobile: { $regex: keyword } }, { name: { $regex: keyword } }],
      });

      if (find_user) {
        res.status(200).json({ find_user });
      } else {
        res.status(400).json({ msg: "No results found for " + mobile });
      }
    } else {
      res.send({ msg: "mobile is not defined" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
