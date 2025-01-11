import  Seller from "../models/seller.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { name, email, sellerId, password } = req.body;

  try {
    const existingSeller = await Seller.findOne({ sellerId });
    if (existingSeller) {
      return res
        .status(400)
        .json({ success: false, message: "Seller ID already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSeller = new Seller({
      name,
      email,
      sellerId,
      password: hashedPassword,
    });
    await newSeller.save();

    res.status(201).json({ success: true, message: "Signup successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const login = async (req, res) => {
  const { sellerId, password } = req.body;

  try {
    const seller = await Seller.findOne({ sellerId });
    if (!seller) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Seller ID or password." });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Seller ID or password." });
    }

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const listSeller = async (req, res) => {
  try {
    const products = await Seller.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};