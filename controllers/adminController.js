import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Driver from "../models/Driver.js";
import Ride from "../models/Ride.js";
import Booking from "../models/Booking.js";
import SupportTicket from "../models/SupportTicket.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==================== CONFIGURATION ====================

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRE = "24h";

// In-memory fare storage (replace with Fare model for persistence)
let fareConfig = {
  pricePerKm: 10,
  baseFare: 50,
  platformFee: 5,
  minimumFare: 30,
  updatedAt: new Date(),
};

// ==================== HELPERS ====================

const generateToken = (id) => {
  return jwt.sign({ _id: id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// ==================== AUTHENTICATION ====================

export const createSuperAdmin = async (req, res) => {
  try {
    const { fullname, email, phone, password } = req.body;

    // Check if any superadmin exists
    const adminExists = await User.findOne({ role: "SUPERADMIN" });
    if (adminExists) {
      return res.status(400).json({ 
        success: false, 
        message: "SuperAdmin already exists. Use login." 
      });
    }

    const hashedPassword = await hashPassword(password);

    const admin = await User.create({
      fullname,
      email,
      phone,
      password: hashedPassword,
      role: "SUPERADMIN",
      isTemporaryPassword: true,
    });

    res.status(201).json({
      success: true,
      message: "SuperAdmin created successfully. Please login.",
      data: {
        id: admin._id,
        fullname: admin.fullname,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "SUPERADMIN" });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        mustResetPassword: user.isTemporaryPassword || false,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetAdminPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    user.password = await hashPassword(newPassword);
    user.isTemporaryPassword = false;
    await user.save();

    res.json({ 
      success: true, 
      message: "Password updated successfully" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DASHBOARD ====================

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalDrivers,
      totalRides,
      totalBookings,
      openTickets,
    ] = await Promise.all([
      User.countDocuments({ role: "USER" }),
      Vendor.countDocuments(),
      Driver.countDocuments(),
      Ride.countDocuments(),
      Booking.countDocuments(),
      SupportTicket.countDocuments({ status: "OPEN" }),
    ]);

    // Recent activity
    const recentUsers = await User.find({ role: "USER" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullname email createdAt");

    const recentRides = await Ride.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("driverId", "vehicle.vehicleNumber");

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVendors,
        totalDrivers,
        totalRides,
        totalBookings,
        openTickets,
      },
      recent: {
        users: recentUsers,
        rides: recentRides,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== USERS ====================

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "USER" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password; // Don't update password here
    delete updates.role; // Don't change role

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "User updated", 
      data: user 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Delete related records
    await Booking.deleteMany({ passengerId: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: "User and related bookings deleted" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== VENDORS ====================

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate("userId", "fullname email phone role createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const getVendorById = async (req, res) => {
//   try {
//     const vendor = await Vendor.findOne({
//       $or: [{ _id: req.params.id }, { userId: req.params.id }],
//     }).populate("userId", "-password");

//     if (!vendor) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Vendor not found" 
//       });
//     }

//     res.status(200).json({ success: true, data: vendor });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const adminCreateVendor = async (req, res) => {
  try {
    const { fullname, email, phone, password, ...vendorData } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email or phone already exists" 
      });
    }

    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      fullname,
      email,
      phone,
      password: hashedPassword,
      role: "VENDOR",
    });

    // Create vendor profile
    const vendor = await Vendor.create({
      ...vendorData,
      userId: user._id,
    });

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adminUpdateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        message: "Vendor not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Vendor updated", 
      data: vendor 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adminDeleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        message: "Vendor not found" 
      });
    }

    // Delete associated user and vendor
    await User.findByIdAndDelete(vendor.userId);
    await Vendor.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: "Vendor and associated user deleted" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        message: "Vendor not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DRIVERS ====================

export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("userId", "fullname email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
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

    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminCreateDriver = async (req, res) => {
  try {
    const { fullname, email, phone, password, ...driverData } = req.body;

    // Check existing
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email or phone already exists" 
      });
    }

    const hashedPassword = await hashPassword(password);

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
      message: "Driver created successfully",
      data: driver,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adminUpdateDriver = async (req, res) => {
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

    res.status(200).json({ 
      success: true, 
      message: "Driver updated", 
      data: driver 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adminDeleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: "Driver not found" 
      });
    }

    // Delete associated user and driver
    await User.findByIdAndDelete(driver.userId);
    await Driver.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: "Driver and associated user deleted" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== RIDES ====================

export const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate({
        path: "driverId",
        populate: { path: "userId", select: "fullname email phone" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate("driverId");

    if (!ride) {
      return res.status(404).json({ 
        success: false, 
        message: "Ride not found" 
      });
    }

    res.status(200).json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminCreateRide = async (req, res) => {
  try {
    const ride = await Ride.create(req.body);

    res.status(201).json({
      success: true,
      message: "Ride created successfully",
      data: ride,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adminUpdateRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!ride) {
      return res.status(404).json({ 
        success: false, 
        message: "Ride not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Ride updated", 
      data: ride 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adminDeleteRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ 
        success: false, 
        message: "Ride not found" 
      });
    }

    // Delete associated bookings
    await Booking.deleteMany({ rideId: ride._id });
    await Ride.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: "Ride and associated bookings deleted" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== BOOKINGS ====================

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("passengerId", "fullname email phone")
      .populate({
        path: "rideId",
        select: "route travelDate driverId pricing",
        populate: {
          path: "driverId",
          select: "userId vehicle.vehicleNumber",
          populate: { path: "userId", select: "fullname" },
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("passengerId", "fullname email phone")
      .populate({
        path: "rideId",
        populate: { path: "driverId", populate: { path: "userId" } },
      });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUpdateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Booking updated", 
      data: booking 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adminDeleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    // Restore ride seats if booking was confirmed
    if (booking.status === "CONFIRMED") {
      await Ride.findByIdAndUpdate(booking.rideId, {
        $inc: { availableSeats: booking.seatsBooked },
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: "Booking deleted" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== FARE ====================

export const getActiveFare = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      fare: fareConfig,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const setFare = async (req, res) => {
  try {
    const { pricePerKm, baseFare, platformFee, minimumFare } = req.body;

    // Validate inputs
    if (pricePerKm !== undefined && (isNaN(pricePerKm) || pricePerKm < 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid pricePerKm" 
      });
    }
    if (baseFare !== undefined && (isNaN(baseFare) || baseFare < 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid baseFare" 
      });
    }
    if (platformFee !== undefined && (isNaN(platformFee) || platformFee < 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid platformFee" 
      });
    }
    if (minimumFare !== undefined && (isNaN(minimumFare) || minimumFare < 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid minimumFare" 
      });
    }

    // Update config
    fareConfig = {
      pricePerKm: pricePerKm !== undefined ? Number(pricePerKm) : fareConfig.pricePerKm,
      baseFare: baseFare !== undefined ? Number(baseFare) : fareConfig.baseFare,
      platformFee: platformFee !== undefined ? Number(platformFee) : fareConfig.platformFee,
      minimumFare: minimumFare !== undefined ? Number(minimumFare) : fareConfig.minimumFare,
      updatedAt: new Date(),
    };

    res.status(200).json({
      success: true,
      message: "Fare configuration updated",
      fare: fareConfig,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate("userId", "-password");

    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        message: "Vendor not found" 
      });
    }

    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};