import User from "../models/User.js";
import Booking from "../models/Booking.js";

// Get current user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update current user profile
export const updateUserProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete current user account
export const deleteUserAccount = async (req, res) => {
  try {
    // Delete user's bookings first
    await Booking.deleteMany({ passengerId: req.user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ success: true, message: "Account deleted successfully" });
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
          select: "userId vehicle.vehicleNumber",
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

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "USER" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: users.length, 
      users 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update any user
export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete any user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete user's bookings
    await Booking.deleteMany({ passengerId: user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};