import express from "express";
import {
  login,
  signup,
  verifyAccount,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/auth.js";
import { isLoggedIn } from "../middlewares/auth.js";
const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/verify/:token", verifyAccount);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", resetPassword); // GET request to display the reset password form
router.post("/reset-password/:token", resetPassword); // POST request to handle the submission of the new password

router.put("/change-password", isLoggedIn, changePassword);

export default router;
