import mongoose from "mongoose";

const VendorVehicleSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true, required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "VendorDriver", default: null },

    vehicleType: { type: String, enum: ["CAR", "BIKE", "AUTO", "OTHER"], default: "CAR" },
    vehicleNo: { type: String, required: true, uppercase: true, trim: true },

    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },

    docs: {
      rcImgs: [{ url: String }],
      vehicleImgs: [{ url: String }],
    },
  },
  { timestamps: true }
);

export default mongoose.models.VendorVehicle || mongoose.model("VendorVehicle", VendorVehicleSchema);