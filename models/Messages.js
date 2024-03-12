import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    content: String,
    sender: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Hisusers",
    },
    receiver: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Hisusers",
    },
    messageId: {
      type: String,
    },
    file: { 
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Messages", MessageSchema);
