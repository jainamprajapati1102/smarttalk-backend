import mongoose, { mongo } from "mongoose";

const messageSchema = mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    msg: { type: String },
    media: { type: String },
    seen: { type: Boolean, default: false },
    is_delete: { type: Boolean, default: false },
    is_delete_all: { type: Boolean, default: false },
    is_delete_by: [mongoose.Schema.Types.ObjectId],
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const messageModel = mongoose.model("message", messageSchema);

export default messageModel;
