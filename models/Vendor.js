// models/Vendor.js
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true }
}, { _id: false });

const vehicleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["MICRO", "SEDAN", "SUV", "LUXURY"], // Exact match from Flutter [file:1]
    required: true
  },
  vehicleNumber: { type: String, required: true },
  model: { type: String, required: true }, // From Flutter vehiclePayload [file:1]
  yearOfManufacture: { 
    type: String, 
    required: true, 
    match: /^\d{4}$/ // 4-digit year validation [file:1]
  },
  seatingCapacity: { type: Number, required: true, min: 1 },
  fuel: {
    type: String,
    enum: ["CNG", "PETROL", "DIESEL", "ELECTRIC", "HYBRID"], // Flutter exact [file:1]
    required: true
  },
  amenities: {
    ac: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    music: { type: Boolean, default: false },
    smoking: { type: Boolean, default: false }
  }
}, { _id: false });

const needsVendorDocs = function () {
  return this.role === "VENDOR";
};

const vendorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  
  // Vendor-specific: GST (only vendors need this) [file:1]
  gstNo: { 
    type: String, 
    required: [needsVendorDocs, "GST number required for vendors"] 
  },
  
  // Same docs as Driver but complete set from Flutter [file:1]
  licenseNo: { type: String, required: true },
  rcNo: { type: String, required: true },
  rcImgs: [imageSchema],
  panNo: { type: String, required: true },
  panImg: [imageSchema],
  driverSelfie: [imageSchema],
  vehicleImgs: [imageSchema],
  
  // Full vehicle object matching Flutter payload exactly [file:1]
  vehicle: {
    type: vehicleSchema,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Vendor", vendorSchema);