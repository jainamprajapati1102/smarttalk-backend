import messageModel from "../models/message.model.js";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import chatModel from "../models/chat.model.js";
import { ChatEventEnum } from "../constants.js";
import mongoose from "mongoose";

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

    // Find chats where user is a participant
    const chats = await chatModel
      .find({
        users: { $elemMatch: { $eq: userId } },
      })
      .populate("users")
      .populate("latest_msg");

    // Add unseen count for each chat
    const chatsWithUnseen = await Promise.all(
      chats.map(async (chat) => {
        const unseenCount = await messageModel.countDocuments({
          chat: chat._id, // messages of this chat
          sender_id: { $ne: userId }, // exclude messages sent by me
          seen: false, // only unseen messages
        });

        return {
          ...chat.toObject(),
          unseenCount, // 👈 new field
        };
      })
    );

    if (chatsWithUnseen.length > 0) {
      res.status(200).json(chatsWithUnseen);
    } else {
      res.status(404).json(false);
    }
  } catch (error) {
    console.log("err frm exist msg-->", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const createGroupChat = async () => {};
export const removeFromGroup = async () => {};
export const renameGroup = async () => {};
export const addToGroup = async () => {};
