import express from "express";
import {
  createRide,
  getRides,
  getRide,
  updateRide,
  deleteRide,
  searchRides,
  bookRide,
  cancelBooking,
} from "../controllers/rideController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getRides);
router.get("/search", searchRides);
router.get("/:id", getRide);

// Protected
router.use(protect);

// User actions
router.post("/:id/book", bookRide);
router.delete("/:id/book", cancelBooking);

// Driver/Admin actions
router.use(authorize("DRIVER", "SUPERADMIN"));
router.post("/", createRide);
router.patch("/:id", updateRide);
router.delete("/:id", deleteRide);

export default router;