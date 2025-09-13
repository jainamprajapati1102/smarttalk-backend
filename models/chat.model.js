import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
  {
    chat_name: { type: String, trim: true },
    is_group: { type: Boolean, default: false },
    chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
      // required: true,
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latest_msg: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    group_admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    is_favorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const chatModel = mongoose.model("chat", chatSchema);
export default chatModel;
