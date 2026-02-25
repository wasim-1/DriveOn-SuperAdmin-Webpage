import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

// Protected
router.use(protect);
router.get("/me", getMe);
router.put("/update-password", updatePassword);

export default router;