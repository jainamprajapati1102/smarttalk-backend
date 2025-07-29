import messageModel from "../models/message.model.js";

export const messageCreateService = async ({
  receiver_id,
  sender_id,
  msg,
  media,
}) => {
  try {
    if (!receiver_id || !sender_id || !msg) {
      throw new Error("All Feilds are required");
    }

    const chat = await messageModel.create({
      receiver_id,
      sender_id,
      msg,
      media,
    });
    return chat;
  } catch (error) {
    console.log(error);
  }
};

export const selected_user_msg_service = async ({ id, login_ID }) => {
  try {
    if (!id) {
      throw new Error("Selected user id is required");
    }

    const result = await messageModel
      .find({
        $or: [
          { sender_id: login_ID, receiver_id: id },
          { sender_id: id, receiver_id: login_ID },
        ],
        is_delete: false,
        is_delete_all: false,
        is_deleted_by: { $ne: login_ID },
      })
      .sort({ createdAt: 1 });
    return result;
  } catch (error) {
    console.log("err frm selected user msg fwetch -->", error);
    return error;
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
