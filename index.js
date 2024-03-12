import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import { startSocketServer } from "./socket.js";


//Routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";

//Import Middlewares
import { isLoggedIn, isAdmin } from "./middlewares/auth.js";

const app = express();
const PORT = process.env.PORT || 3001;
dotenv.config();
app.use(cors());

//middlewares
app.use(bodyParser.json());

//configure Routes
app.use("/auth", authRoutes);
app.use("/admin", isLoggedIn, isAdmin, adminRoutes);
app.use("/user", isLoggedIn, userRoutes);

//Database connection
mongoose
  .connect(`${process.env.DB_URL}`)
  .then(() => console.log("Database connected Successfully"))
  .catch((err) => `Database connection failed: ${err.message}`);

const server = app.listen(PORT, () =>
  console.log(`App is listening at ${PORT}`)
);

startSocketServer(server);
