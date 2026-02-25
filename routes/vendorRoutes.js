// import express from "express";
// import {
//   registerVendor,
//   getVendorProfile,
//   updateVendorProfile,
//   getVendorDrivers,
//   addVendorDriver,
//   updateVendorDriver,
//   deleteVendorDriver,
// } from "../controllers/vendorController.js";
// import { protect, authorize } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Public
// router.post("/register", registerVendor);

// // Protected - Vendor only
// router.use(protect);
// router.use(authorize("VENDOR"));

// router.get("/profile", getVendorProfile);
// router.patch("/profile", updateVendorProfile);
// router.get("/drivers", getVendorDrivers);
// router.post("/drivers", addVendorDriver);
// router.patch("/drivers/:id", updateVendorDriver);
// router.delete("/drivers/:id", deleteVendorDriver);

// export default router;

import express from "express";
import {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorDrivers,
  addVendorDriver,
  updateVendorDriver,
  deleteVendorDriver,
  getAllVendors,        // ADD THIS
  getVendorById,        // ADD THIS
} from "../controllers/vendorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/register", registerVendor);

// Protected - Vendor or Admin
router.use(protect);

// Allow SUPERADMIN to access all vendor routes
router.use(authorize("VENDOR", "SUPERADMIN"));

// Vendor profile routes
router.get("/profile", getVendorProfile);
router.patch("/profile", updateVendorProfile);
router.get("/drivers", getVendorDrivers);
router.post("/drivers", addVendorDriver);
router.patch("/drivers/:id", updateVendorDriver);
router.delete("/drivers/:id", deleteVendorDriver);

// Admin routes for vendors - ADD THESE
router.get("/", authorize("SUPERADMIN"), getAllVendors);
router.get("/:id", authorize("SUPERADMIN"), getVendorById);

export default router;