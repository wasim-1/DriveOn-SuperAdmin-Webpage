import Booking from "../models/Booking.js";
import Ride from "../models/Ride.js";

// Get all bookings (admin)
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("passengerId", "fullname email phone")
      .populate({
        path: "rideId",
        select: "route travelDate driverId pricing",
        populate: {
          path: "driverId",
          select: "userId vehicle.vehicleNumber",
          populate: { path: "userId", select: "fullname" }
        }
      })
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: bookings.length, 
      bookings 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single booking
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("passengerId", "fullname email phone")
      .populate({
        path: "rideId",
        populate: { 
          path: "driverId",
          populate: { path: "userId", select: "fullname phone" }
        }
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Check if user owns this booking or is admin
    if (
      booking.passengerId._id.toString() !== req.user._id.toString() &&
      req.user.role !== "SUPERADMIN"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create booking
export const createBooking = async (req, res) => {
  try {
    const { rideId, seatsBooked } = req.body;

    // Check ride exists and has seats
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    if (ride.availableSeats < seatsBooked) {
      return res.status(400).json({ 
        success: false, 
        message: "Not enough seats available" 
      });
    }

    // Calculate total
    const totalAmount = seatsBooked * ride.pricing.pricePerSeat;

    // Create booking
    const booking = await Booking.create({
      rideId,
      passengerId: req.user._id,
      seatsBooked,
      totalAmount,
      status: "CONFIRMED"
    });

    // Update available seats
    ride.availableSeats -= seatsBooked;
    await ride.save();

    res.status(201).json({ 
      success: true, 
      message: "Booking confirmed",
      data: booking 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update booking
export const updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Only admin or booking owner can update
    if (
      booking.passengerId.toString() !== req.user._id.toString() &&
      req.user.role !== "SUPERADMIN"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel/Delete booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Check authorization
    if (
      booking.passengerId.toString() !== req.user._id.toString() &&
      req.user.role !== "SUPERADMIN"
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Restore ride seats if confirmed
    if (booking.status === "CONFIRMED") {
      await Ride.findByIdAndUpdate(booking.rideId, {
        $inc: { availableSeats: booking.seatsBooked }
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passengerId: req.user._id })
      .populate({
        path: "rideId",
        select: "route travelDate startTime pricing status",
        populate: {
          path: "driverId",
          select: "vehicle.vehicleNumber",
          populate: { path: "userId", select: "fullname phone" }
        }
      })
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: bookings.length, 
      bookings 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};