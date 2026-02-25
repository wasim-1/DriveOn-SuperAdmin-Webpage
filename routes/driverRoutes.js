import express from "express";
import {
  registerDriver,
  getDriverProfile,
  updateDriverProfile,
  updateDriverDocuments,
  getDriverRides,
  getDriverEarnings,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from "../controllers/driverController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/register", registerDriver);

// Protected routes
router.use(protect);

// Driver profile routes (DRIVER only)
router.get("/profile", authorize("DRIVER"), getDriverProfile);
router.patch("/profile", authorize("DRIVER"), updateDriverProfile);
router.patch("/documents", authorize("DRIVER"), updateDriverDocuments);
router.get("/rides", authorize("DRIVER"), getDriverRides);
router.get("/earnings", authorize("DRIVER"), getDriverEarnings);

// Admin routes (SUPERADMIN can access due to middleware fix)
router.get("/", authorize("SUPERADMIN"), getAllDrivers);
router.get("/:id", authorize("SUPERADMIN"), getDriverById);
router.patch("/:id", authorize("SUPERADMIN"), updateDriver);
router.delete("/:id", authorize("SUPERADMIN"), deleteDriver);

export default router;