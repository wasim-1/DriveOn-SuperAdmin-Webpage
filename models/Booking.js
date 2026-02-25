import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    required: true,
    index: true
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  seatsBooked: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ["CONFIRMED", "CANCELLED", "COMPLETED"],
    default: "CONFIRMED"
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

bookingSchema.index({ rideId: 1, passengerId: 1 }, { unique: true });

export default mongoose.model("Booking", bookingSchema);
