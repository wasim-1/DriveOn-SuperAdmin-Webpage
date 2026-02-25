import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
});

const needsIdentityDocs = function () {
  return ["DRIVER", "VENDOR"].includes(this.role);
};

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["USER", "DRIVER", "VENDOR", "SUPERADMIN"],
      default: "USER",
    },
    dob: { 
      type: Date, 
      required: [needsIdentityDocs, "Date of birth is required"] 
    },
    aadhar: {
      type: String,
      required: [needsIdentityDocs, "Aadhar number is required"]
    },
    aadharImgs: [imageSchema],
    licenseNo: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);