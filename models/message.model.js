import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    msg: { type: String },
    attachments: {
      type: [
        {
          url: String,
          localPath: String,
        },
      ],
      default: [],
    },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "chat" },
    seen: { type: Boolean, default: false },
    is_delete: { type: Boolean, default: false },
    is_delete_all: { type: Boolean, default: false },
    is_delete_by: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
