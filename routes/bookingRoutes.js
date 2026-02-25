import express from "express";
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  getUserBookings,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// User bookings
router.get("/my-bookings", getUserBookings);

// General routes
router.get("/", authorize("SUPERADMIN"), getBookings);
router.get("/:id", getBooking);
router.post("/", createBooking);
router.patch("/:id", updateBooking);
router.delete("/:id", cancelBooking);

export default router;