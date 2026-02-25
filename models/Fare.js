// models/Fare.js
import mongoose from "mongoose";

const fareSchema = new mongoose.Schema({
  // We use a constant key to ensure only one active config exists
  configType: { type: String, default: "GLOBAL", unique: true },
  pricePerKm: { type: Number, required: true, default: 0 },
  baseFare: { type: Number, required: true, default: 0 },
  platformFee: { type: Number, required: true, default: 0 },
  minimumFare: { type: Number, required: true, default: 0 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Fare", fareSchema);