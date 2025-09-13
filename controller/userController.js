import { validationResult } from "express-validator";
import { createUser } from "../service/user.service.js";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const signup = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body is empty" });
    }
    // console.log("user bod controller -->", req.body);

    // const error = validationResult(req);
    const { name, mobile } = req.body;

    // if (!error.isEmpty()) {
    //   return res.status(400).json({ errors: error.array() });
    // }
    // // const hashPass = await userModel.hashedPassword(password);
    let profilePic = req.file ? req.file.filename : null;
    console.log("after set name->>", profilePic);
    const chqMatch = await userModel.findOne({ mobile });

    if (chqMatch) {
      return res.status(300).json({ msg: "Mobile has already register" });
    }
    const user = await createUser({ name, mobile, profilePic });
    const token = await user.generateToken();
    res.status(200).json(user);
    // res.end();
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

export const signin = async (req, res) => {
  try {
    console.log(req.body);
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
          httpOnly: true,
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
export const authCheck = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    res.json({ user });
  } catch (error) {
    // console.log(error);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ msg: "Logged out" });
};
export const search_user = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ msg: "mobile is not defined" });
    }

    const keyword = mobile.trim();
    const find_user = await userModel.find({
      _id: { $ne: req.user._id },
      $or: [
        { mobile: { $regex: keyword, $options: "i" } },
        { name: { $regex: keyword, $options: "i" } },
      ],
    });

    if (find_user.length === 0) {
      return res.status(200).json([]); // return empty array, not 404
    }

    res.status(200).json(find_user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
};

export const allUser = async (req, res) => {
  try {
    const results = await userModel.find();
    res.status(200).json(results);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const update_user_data = async (req, res) => {
  try {
    const { profilePic, name, about } = req.body;
    const response = await userModel.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { profilePic: profilePic, name: name, about: about } },
      { new: true }
    );
    if (response) {
      res.status(200).send({ msg: "update successfully", response });
    } else {
      res.status(400).send({ msg: "not update" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};
