import jwt from "jsonwebtoken";
import {
  messageCreateService,
  msg_delete_me_service,
  selected_user_msg_service,
} from "../service/message.service.js";
import mongoose from "mongoose";
import messageModel from "../models/message.model.js";
import { validationResult } from "express-validator";

export const message_create = async (req, res) => {
  try {
    if (!req.body) {
      throw new Error("Body is empty");
    }
    const { receiver_id, sender_id, msg, media } = req.body;
    const sender = jwt.verify(sender_id, "sm?>{}+arttal!_&&*k?@s");

    const chat = await messageCreateService({
      receiver_id,
      sender_id: sender,
      msg,
      media,
    });
    res.status(200).send({ msg: "msg send", chat });
  } catch (error) {
    console.log(error);
  }
};

export const selectedUser_msg = async (req, res) => {
  try {
    const { id, login_id } = req.body;
    let login_ID = jwt.verify(login_id, process.env.JWT_SECRETE);
    const response = await selected_user_msg_service({ id, login_ID });
    res.status(200).send({ messages: response });
  } catch (error) {
    console.log("err frm selected user msg controller-->", error);
  }
};

export const exist_msg = async (req, res) => {
  try {
    const { id } = req.body;
    let decode_user = jwt.verify(id, "sm?>{}+arttal!_&&*k?@s");
    // const response = await messageModel.find({ receiver_id: decode_user._id });
    const receiverId = new mongoose.Types.ObjectId(decode_user._id);
    const response = await messageModel.aggregate([
      {
        $match: { receiver_id: receiverId },
      },
      {
        $group: {
          _id: "$sender_id",
          msg: { $push: "$$ROOT" },
          lastMsgTime: { $last: "$createdAt" },
        },
      },
      {
        $sort: { lastMsgTime: -1 },
      },
      {
        $lookup: {
          from: "users", // 👈 name of your users collection
          localField: "_id", // _id here is sender_id (grouped)
          foreignField: "_id", // in users collection
          as: "sender_info", // array of matched user docs
        },
      },
      {
        $unwind: "$sender_info", // flatten the array to object
      },
      {
        $addFields: {
          unseenCount: {
            $size: {
              $filter: {
                input: "$msg",
                as: "m",
                // cond: { $eq: ["$$m.seen", false] },
                cond: {
                  $and: [
                    { $ne: ["$$m.seen", true] },
                    { $ne: ["$$m.seen", null] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          msg: 1,
          lastMsgTime: 1,
          senderName: "$sender_info.name", // 👈 only include name
          senderProfilePic: "$sender_info.profilePic", // optional
          unseenCount: 1,
        },
      },
    ]);

    if (response) {
      res.status(200).send({ exist: response });
    }
  } catch (error) {
    console.log("err frm exist msg-->", error);
  }
};

export const msg_seen = async (req, res) => {
  try {
    const { id, login_id } = req.body;
    if (!id && !login_id) {
      res.status(400).send("selected user and login user id not found");
    }

    const decode_log_id = jwt.verify(login_id, process.env.JWT_SECRETE);
    const result = await messageModel.updateMany(
      {
        receiver_id: decode_log_id,
        sender_id: id,
        seen: { $ne: true },
      },
      {
        $set: { seen: true },
      }
    );

    res.status(200).send({ msg: "all msg seen" });
  } catch (error) {
    res.status(400).send(error);
  }
};

export const msg_delete_me = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);

      return res.status(400).json({ errors: errors.array() });
    }
    const { id, login_id, msg_id } = req.body;
    console.log(req.body);

    const decode_log_id = await jwt.verify(login_id, process.env.JWT_SECRETE);
    console.log("decode_id", decode_log_id);

    const response = await msg_delete_me_service({
      id,
      login_id: decode_log_id._id,
      msg_id,
    });

    if (response) {
      
      res.status(200).send({ msg: "msg was deleted", response });
    }else{
      console.log('res not received');
      
    }
  } catch (error) {
    console.log(error);

    res.status(400).send(error);
  }
};
export const msg_delete_all = async (req, res) => {};
