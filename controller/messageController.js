import jwt from "jsonwebtoken";
import {
  messageCreateService,
  msg_delete_me_service,
  allMessage_service,
  msg_delete_all_service,
} from "../service/message.service.js";
import mongoose from "mongoose";
import messageModel from "../models/message.model.js";
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";
// import { emitSocketEvent } from "../socket/index.js";
import { ChatEventEnum } from "../constants.js";
import chatModel from "../models/chat.model.js";

export const message_create = async (req, res) => {
  try {
    if (!req.user._id) return res.status(400).send("please loggeding");
    var { msg, attachments, chatId } = req.body;

    let media = null;
    chatId = new mongoose.Types.ObjectId(chatId);
    let attachmentData = [];
    if (req.file) {
      attachmentData = [
        {
          url: req.file.filename,
          localPath: req.file.path,
        },
      ];
    }
    var message = await messageCreateService({
      sender_id: req.user._id,
      msg,
      attachments: attachmentData,
      chatId,
    });

    message = await message.populate("sender_id", "name mobile email");
    message = await message.populate("chat");
    message = await userModel.populate(message, {
      path: "chat.users",
      select: "name profilePic email",
    });
    if (message) {
      await chatModel.findByIdAndUpdate(chatId, {
        latest_msg: message,
      });
      return res.status(201).send({ msg: "message created", message });
    }
  } catch (error) {
    console.log(error);
    res.status(400);
  }
};
export const allMessage = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 20;

    const response = await allMessage_service({
      chat: req.params.chatId,
      sender_id: req.user._id,
      skip,
      limit,
    });
    return res.status(200).send({ messages: response });
  } catch (error) {
    console.log("err frm selected user msg controller-->", error);
    return res.status(400);
  }
};

export const msg_seen = async (req, res) => {
  try {
    const { chat_id } = req.body;
    console.log("frm msg_seen->", chat_id);

    const response = await messageModel.updateMany(
      {
        chat: chat_id,
        sender_id: { $ne: req.user._id },
        // is_delete: false,
        // is_delete_all: false,
        seen: false,
      },
      { $set: { seen: true } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      modifiedCount: response.modifiedCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
};
export const msg_delete_me = async (req, res) => {
  try {
    const { msg_id, chat_id } = req.body;
    const result = await msg_delete_me_service({
      msg_id,
      chat_id,
      is_deleted_by: req.user._id,
    });
    if (result) {
      console.log("msg deleted");

      res.status(200).send({ msg: "msg was deleted", result });
    } else {
      console.log("msg deleteion failed");
    }
  } catch (error) {
    console.log(error);
  }
};

export const msg_delete_all = async (req, res) => {
  try {
    const { msg_id, chat_id } = req.body;
    const sender_id = req.user.id;
    const result = await msg_delete_all_service({
      msg_id,
      chat_id,
    });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(400).send({ msg: "message not deleted" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};
