import mongoose from "mongoose";
import messageModel from "../models/message.model.js";
import { getPresignedUrl } from "../config/s3Utils.js";
export const messageCreateService = async ({
  sender_id,
  msg,
  attachments,
  chatId,
}) => {
  try {
    if (!sender_id || !chatId) {
      throw new Error("All fields are required");
    }

    const message = await messageModel.create({
      sender_id,
      msg,
      chat: chatId,
      attachments,
    });

    return message;
  } catch (error) {
    console.error("Error in messageCreateService:", error.message);
    throw error;
  }
};

export const allMessage_service = async ({ chat, sender_id, skip, limit }) => {
  try {
    if (!chat) {
      throw new Error("Selected user id is required");
    }
    const senderObjectId = new mongoose.Types.ObjectId(sender_id);

    const result = await messageModel
      .find({
        chat,
        is_delete_all: false,
        $or: [{ is_delete: false }, { is_deleted_by: { $ne: senderObjectId } }],
      })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("sender_id", "name email profilePic")
      .populate("chat");

    return result;
  } catch (error) {
    console.log("err frm selected user msg fwetch -->", error);
    throw new Error(error.message);
  }
};

export const msg_delete_me_service = async ({
  msg_id,
  chat_id,
  is_deleted_by,
}) => {
  try {
    const response = await messageModel.findOneAndUpdate(
      {
        _id: msg_id,
        chat: chat_id,
      },
      {
        $addToSet: { is_delete_by: is_deleted_by },
        $set: { is_delete: true },
      },
      { new: true }
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const msg_delete_all_service = async ({ chat_id, msg_id }) => {
  try {
    const response = await messageModel.findOneAndUpdate(
      {
        _id: msg_id,
        chat: chat_id,
      },
      {
        $set: { is_delete_all: true },
      },
      { new: true }
    );
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};
