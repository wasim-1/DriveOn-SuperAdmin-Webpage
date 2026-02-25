import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true }
});

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // This establishes the user relationship
    required: true,
    unique: true
  },
  rcNo: { type: String, required: true },
  rcImgs: [imageSchema],
  vehicleImgs: [imageSchema],
  // Nested Vehicle Object
  vehicle: {
    type: {
      type: String,
      enum: ["SEDAN", "SUV", "HATCHBACK", "MICRO", "LUXURY"],
      required: true
    },
    vehicleNumber: { type: String, required: true },
    seatingCapacity: { type: Number, required: true },
    fuel: {
      type: String,
      enum: ["PETROL", "DIESEL", "ELECTRIC", "CNG" , "HYBRID"],
      required: true
    },
    amenities: {
      ac: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      music: { type: Boolean, default: false },
      smoking: { type: Boolean, default: false }
    }
  },
  panNo: { type: String },
  panImg: [imageSchema],
  driverSelfie: [imageSchema]
}, { timestamps: true });

export default mongoose.model("Driver", driverSchema);