import dotenv from "dotenv";
dotenv.config();

import express, { json } from "express";
import cookieParese from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";

// routes
import authRouter from "./routes/auth.route.js";
import eventRouter from "./routes/event.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParese());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/event", eventRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
