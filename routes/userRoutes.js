import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getUserBookings,
  getAllUsers,        // ADD THIS
  getUserById,        // ADD THIS
  updateUser,         // ADD THIS
  deleteUser,         // ADD THIS
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes protected
router.use(protect);

// User profile routes
router.get("/profile", getUserProfile);
router.patch("/profile", updateUserProfile);
router.delete("/account", deleteUserAccount);

// User bookings
router.get("/bookings", getUserBookings);

// Admin only routes
router.get("/", authorize("SUPERADMIN"), getAllUsers);
router.get("/:id", authorize("SUPERADMIN"), getUserById);
router.patch("/:id", authorize("SUPERADMIN"), updateUser);
router.delete("/:id", authorize("SUPERADMIN"), deleteUser);

export default router;