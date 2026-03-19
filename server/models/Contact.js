import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'closed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: [{
      content: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    response: {
      content: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      respondedAt: Date,
    },
    isSpam: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['website', 'email', 'phone', 'social'],
      default: 'website',
    },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", ContactSchema);
