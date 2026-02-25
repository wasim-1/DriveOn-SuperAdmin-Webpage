import Vendor from "../models/Vendor.js";

export const registerVendor = async (req, res) => {
  try {
    res.status(201).json({ success: true, message: "Vendor registered" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id })
      .populate("userId", "-password");
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true }
    );
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorDrivers = async (req, res) => {
  try {
    res.json({ success: true, drivers: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addVendorDriver = async (req, res) => {
  try {
    res.status(201).json({ success: true, message: "Driver added" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVendorDriver = async (req, res) => {
  try {
    res.json({ success: true, message: "Driver updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteVendorDriver = async (req, res) => {
  try {
    res.json({ success: true, message: "Driver deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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