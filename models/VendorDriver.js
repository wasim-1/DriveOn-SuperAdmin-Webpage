import mongoose from "mongoose";

const VendorDriverSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true, required: true },

    fullname: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, required: true },

    licenseNo: { type: String, default: "" },
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "PENDING"], default: "PENDING" },

    docs: {
      aadharImgs: [{ url: String }],
      licenseImgs: [{ url: String }],
      selfieImg: { url: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.VendorDriver || mongoose.model("VendorDriver", VendorDriverSchema);