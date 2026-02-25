import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
    index: true
  },
  route: {
    startCity: { type: String, required: true },
    endCity: { type: String, required: true },
    checkpoints: [{ type: String }]
  },
  travelDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  pricing: {
    pricePerSeat: { type: Number, required: true, min: 0 },
    fullCarPrice: Number,
    parcelPricePerKg: Number
  },
  totalSeats: { type: Number, required: true, min: 1, max: 8 },
  availableSeats: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["OPEN", "FULL", "ONGOING", "CANCELLED", "COMPLETED"],
    default: "OPEN"
  },
  parcelAllowed: { type: Boolean, default: false },
  availableSeatsUpdatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Ride", rideSchema);
