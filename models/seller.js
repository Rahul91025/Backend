import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  sellerId: { type: String, unique: true },
  password: { type: String, required: true },
});

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
