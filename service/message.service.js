import messageModel from "../models/message.model.js";

// export const messageCreateService = async ({
//   receiver_id,
//   sender_id,
//   msg,
//   attachments,
// }) => {
//   try {
//     if (!receiver_id || !sender_id) {
//       throw new Error("All Feilds are required");
//     }

//     const chat = await messageModel.create({
//       receiver_id,
//       sender_id,
//       msg,
//       attachments,
//     });
//     return chat;
//   } catch (error) {
//     console.log(error);
//   }
// };

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

export const allMessage_service = async ({ chat, sender_id }) => {
  try {
    if (!chat) {
      throw new Error("Selected user id is required");
    }

    const result = await messageModel
      .find({
        // sender_id: sender_id,
        chat,
        // is_delete: false,
        // is_delete_all: false,
        // is_deleted_by: { $ne: sender_id },
      })
      .sort({ createdAt: 1 })
      .populate("sender_id", "name email profilePic")
      .populate("chat");
    return result;
  } catch (error) {
    console.log("err frm selected user msg fwetch -->", error);
    throw new Error(error.message);
  }
};

export const msg_delete_me_service = async ({ id, login_id, msg_id }) => {
  try {
    console.log(
      "delete service",
      "id->",
      id,
      "login->",
      login_id,
      "msg->",
      msg_id
    );

    const delete_msg_me = await messageModel.findOneAndUpdate(
      {
        $or: [{ receiver_id: login_id }, { sender_id: login_id }],
        _id: msg_id,
        is_delete_all: false,
      },
      {
        $addToSet: { is_deleted_by: login_id },
        $set: { is_delete: true },
      },
      { new: true }
    );
    console.log(delete_msg_me);
    return delete_msg_me;
  } catch (error) {
    console.log(error);

    return error;
  }
};
