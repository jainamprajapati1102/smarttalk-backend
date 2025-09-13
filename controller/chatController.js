import messageModel from "../models/message.model.js";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import chatModel from "../models/chat.model.js";
import { ChatEventEnum } from "../constants.js";
import mongoose from "mongoose";
import { createGroupChatService } from "../service/chatService.js";

export const accessChat = async (req, res) => {
  const { userId } = req.body;
  console.log("accesschat", req.user);

  if (!userId) {
    return res.status(400).send({ msg: "userId param not sent with request" });
  }

  // prevent creating chat with self
  if (req.user._id.toString() === userId.toString()) {
    return res
      .status(400)
      .send({ msg: "Logged-in user can't create chat with themselves" });
  }

  const userExist = await userModel.findById(userId);
  if (!userExist) {
    return res.status(404).send({ msg: "User not found" });
  }

  // check if chat already exists
  let isChat = await chatModel
    .find({
      is_group: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
    .populate("users", "-password")
    .populate("latest_msg");

  // populate sender details in latest message
  isChat = await chatModel.populate(isChat, {
    path: "latest_msg.sender_id",
    select: "name mobile profilePic",
  });

  if (isChat.length > 0) {
    return res.status(200).json(isChat[0]);
  }

  // create new chat
  try {
    const createChat = await chatModel.create({
      chat_name: "sender",
      users: [req.user._id, userId],
      is_group: false,
    });
    return res.status(201).json(createChat);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ msg: "Server error" });
  }
};

// export const fetchChat = async (req, res) => {
//   try {
//     const receiverId = new mongoose.Types.ObjectId(req.user._id);

//     const response = await chatModel
//       .find({
//         users: { $elemMatch: { $eq: receiverId } },
//       })
//       .populate("users")
//       .populate("latest_msg");

//     if (response.length > 0) {
//       res.status(200).json(response);
//     } else {
//       res.status(404).json(false);
//     }
//   } catch (error) {
//     console.log("err frm exist msg-->", error);
//   }
// };

export const fetchChat = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Find chats where user is a participant
    const chats = await chatModel
      .find({
        users: { $elemMatch: { $eq: userId } },
      })
      .populate("users")
      .populate({
        path: "latest_msg",
        populate: { path: "sender_id", select: "name email" }, // optional sender info
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Add unseen count for each chat
    const chatsWithUnseen = await Promise.all(
      chats.map(async (chat) => {
        const unseenCount = await messageModel.countDocuments({
          chat: chat._id,
          sender_id: { $ne: userId },
          seen: false,
        });

        return {
          ...chat.toObject(),
          unseenCount,
        };
      })
    );

    // Sort by latest_msg.createdAt (descending: newest first)
    const sortedChats = chatsWithUnseen.sort((a, b) => {
      const dateA = a.latest_msg?.createdAt
        ? new Date(a.latest_msg.createdAt)
        : new Date(0);
      const dateB = b.latest_msg?.createdAt
        ? new Date(b.latest_msg.createdAt)
        : new Date(0);
      return dateB - dateA;
    });

    if (sortedChats.length > 0) {
      res.status(200).json(sortedChats);
    } else {
      res.status(404).json(false);
    }
  } catch (error) {
    console.log("err frm exist msg-->", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const createGroupChat = async (req, res) => {
  console.log("Incoming body:", req.body);

  try {
    let { users, chat_name, group_profile } = req.body;

    if (typeof users === "string") {
      try {
        users = JSON.parse(users);
      } catch {
        users = users.split(",").map((u) => u.trim());
      }
    }

    if (!Array.isArray(users)) {
      return res
        .status(400)
        .json({ msg: "Invalid format: 'users' must be an array" });
    }
    users.push(req.user._id);

    users = [...new Set(users.map((id) => id.toString()))];

    const result = await createGroupChatService({
      chat_name,
      group_profile,
      users: [...users], // ✅ safe now
      group_admin: req.user._id,
      is_group: true,
    });

    if (result) {
      res.status(200).send({ msg: "Group created successfully", result });
    } else {
      res.status(401).json({ msg: "Group not created" });
    }
  } catch (error) {
    console.error("Error creating group chat:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const removeFromGroup = async (req, res) => {
  try {
    const { user_id, chat_id } = req.body;
    if (!chat_id || !user_id) {
      return res.status(400).json({ msg: "chat_id and user_id are required" });
    }

    const validUser = await chatModel.findOne({ _id: chat_id, users: user_id });
    if (!validUser) {
      return res
        .status(404)
        .json({ msg: "Chat not found or user not in this group" });
    }
    const updateChat = await chatModel.findByIdAndUpdate(
      chat_id,
      { $pull: { users: user_id } },
      { new: true }
    );
    return res
      .status(200)
      .json({ msg: "User removed from group successfully", updateChat });
  } catch (error) {
    console.error("Error removing user from group:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
export const renameGroup = async () => {};
export const addToGroup = async () => {};
