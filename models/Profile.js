import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  bio: { type: String, default: "No bio provided" },
  contactNumber: { type: String, default: "" },
  address: { type: String, default: "" },
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
