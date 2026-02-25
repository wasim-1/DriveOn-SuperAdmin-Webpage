import mongoose from "mongoose";

const SupportTicketSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true, required: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },

    status: { type: String, enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"], default: "OPEN" },

    thread: [
      {
        by: { type: String, enum: ["VENDOR", "ADMIN"], required: true },
        message: { type: String, required: true },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);