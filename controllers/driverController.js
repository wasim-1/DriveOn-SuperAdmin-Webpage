import Driver from "../models/Driver.js";
import User from "../models/User.js";
import Ride from "../models/Ride.js";
import Booking from "../models/Booking.js";
import bcrypt from "bcryptjs";

// ==================== PUBLIC ====================

export const registerDriver = async (req, res) => {
  try {
    const { fullname, email, phone, password, ...driverData } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email or phone already exists" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullname,
      email,
      phone,
      password: hashedPassword,
      role: "DRIVER",
    });

    // Create driver profile
    const driver = await Driver.create({
      ...driverData,
      userId: user._id,
    });

    res.status(201).json({
      success: true,
      message: "Driver registered successfully",
      data: driver,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DRIVER PROFILE ====================

export const getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id })
      .populate("userId", "-password");

    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: "Driver profile not found" 
      });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: "Driver profile not found" 
      });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDriverDocuments = async (req, res) => {
  try {
    const { rcImgs, vehicleImgs, panImg, driverSelfie } = req.body;

    const driver = await Driver.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          ...(rcImgs && { rcImgs }),
          ...(vehicleImgs && { vehicleImgs }),
          ...(panImg && { panImg }),
          ...(driverSelfie && { driverSelfie }),
        },
      },
      { new: true }
    );

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDriverRides = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: "Driver not found" 
      });
    }

    const rides = await Ride.find({ driverId: driver._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: rides.length, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDriverEarnings = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: "Driver not found" 
      });
    }

    // Get all completed bookings for driver's rides
    const rides = await Ride.find({ driverId: driver._id });
    const rideIds = rides.map(r => r._id);

    const bookings = await Booking.find({
      rideId: { $in: rideIds },
      status: "COMPLETED",
    });

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.json({
      success: true,
      totalEarnings,
      totalTrips: bookings.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ADMIN ROUTES ====================

export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("userId", "fullname email phone role createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate("userId", "-password");

    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: "Driver not found" 
      });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: "Driver not found" 
      });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: "Driver not found" 
      });
    }

    // Delete associated user
    await User.findByIdAndDelete(driver.userId);
    
    // Delete driver
    await Driver.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Driver deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};