import Ride from "../models/Ride.js";

export const getRides = async (req, res) => {
  try {
    const rides = await Ride.find().populate("driverId");
    res.json({ success: true, count: rides.length, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate("driverId");
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });
    res.json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRide = async (req, res) => {
  try {
    const ride = await Ride.create({ ...req.body, driverId: req.user._id });
    res.status(201).json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRide = async (req, res) => {
  try {
    await Ride.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Ride deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchRides = async (req, res) => {
  try {
    const { startCity, endCity, date } = req.query;
    const query = {};
    
    if (startCity) query["route.startCity"] = new RegExp(startCity, "i");
    if (endCity) query["route.endCity"] = new RegExp(endCity, "i");
    if (date) query.travelDate = { $gte: new Date(date) };
    
    const rides = await Ride.find(query).populate("driverId");
    res.json({ success: true, count: rides.length, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bookRide = async (req, res) => {
  try {
    res.json({ success: true, message: "Booking created" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    res.json({ success: true, message: "Booking cancelled" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};