import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  sizes: { type: [String], required: true },
  bestseller: { type: Boolean, default: false },
  image: { type: [String], required: true },
  marketName: { type: String, required: true },
  sellerId:{ type: String},
  storeAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    latitude: String,
    longitude: String,
  },
  date: { type: Date, default: Date.now },
});




const productModel = mongoose.model("Product", productSchema);

export default productModel;
