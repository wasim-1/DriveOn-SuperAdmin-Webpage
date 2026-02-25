import mongoose from "mongoose";

const VendorActivitySchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true, required: true },
    type: { type: String, required: true }, // DRIVER_CREATED, VEHICLE_UPDATED, BOOKING_VIEWED, etc.
    refId: { type: String, default: "" },
    message: { type: String, default: "" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.VendorActivity || mongoose.model("VendorActivity", VendorActivitySchema);