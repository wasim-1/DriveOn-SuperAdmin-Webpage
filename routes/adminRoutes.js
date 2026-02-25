import express from "express";
import {
  // Auth
  adminLogin,
  createSuperAdmin,
  resetAdminPassword,
  
  // Dashboard
  getDashboardStats,
  
  // Users
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  
  // Vendors
  getAllVendors,
  getVendorById,        // Make sure this is imported
  adminCreateVendor,
  adminUpdateVendor,
  adminDeleteVendor,
  updateVendorStatus,
  
  // Drivers
  getAllDrivers,
  getDriverById,
  adminCreateDriver,
  adminUpdateDriver,
  adminDeleteDriver,
  
  // Rides
  getAllRides,
  getRideById,
  adminCreateRide,
  adminUpdateRide,
  adminDeleteRide,
  
  // Bookings
  getAllBookings,
  getBookingById,
  adminUpdateBooking,
  adminDeleteBooking,
  
  // Fare
  getActiveFare,
  setFare,
} from "../controllers/adminController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

router.post("/login", adminLogin);
router.post("/setup", createSuperAdmin);

// ==================== PROTECTED MIDDLEWARE ====================

router.use(protect);
router.use(authorize("SUPERADMIN"));

// ==================== AUTH ====================

router.post("/reset-password", resetAdminPassword);

// ==================== DASHBOARD ====================

router.get("/stats", getDashboardStats);

// ==================== USERS ====================

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// ==================== VENDORS ====================

router.get("/vendors", getAllVendors);
router.get("/vendors/:id", getVendorById);        // ✅ ADD THIS
router.post("/vendors", adminCreateVendor);
router.patch("/vendors/:id", adminUpdateVendor);
router.delete("/vendors/:id", adminDeleteVendor);
router.patch("/vendors/:id/status", updateVendorStatus);

// ==================== DRIVERS ====================

router.get("/drivers", getAllDrivers);
router.get("/drivers/:id", getDriverById);
router.post("/drivers", adminCreateDriver);
router.patch("/drivers/:id", adminUpdateDriver);
router.delete("/drivers/:id", adminDeleteDriver);

// ==================== RIDES ====================

router.get("/rides", getAllRides);
router.get("/rides/:id", getRideById);
router.post("/rides", adminCreateRide);
router.patch("/rides/:id", adminUpdateRide);
router.delete("/rides/:id", adminDeleteRide);

// ==================== BOOKINGS ====================

router.get("/bookings", getAllBookings);
router.get("/bookings/:id", getBookingById);
router.patch("/bookings/:id", adminUpdateBooking);
router.delete("/bookings/:id", adminDeleteBooking);

// ==================== FARE ====================

router.get("/fare/active", getActiveFare);
router.post("/fare/set", setFare);

export default router;