import express from "express";
import { signup, login, listSeller } from "../controllers/sellerController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/sellerlist", listSeller);

export default router;
