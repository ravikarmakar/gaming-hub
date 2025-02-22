import dotenv from "dotenv";
dotenv.config();

import express, { json } from "express";
import cookieParese from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

import connectDB from "./config/db.js";

// IMPORTED ALL ROUTES
import authRouter from "./routes/auth.route.js";
import teamRouter from "./routes/team.route.js";
import userRouter from "./routes/user.route.js";

// Event Routes
import eventRouter from "./routes/event.route.js";
import prizeRouter from "./routes/event-routes/prize.route.js";
import roundsRouter from "./routes/event-routes/round.route.js";
import groupsRouter from "./routes/event-routes/group.route.js";
import leaderboardRouter from "./routes/event-routes/leaderboard.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(morgan("combined"));
app.use(cookieParese());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ALL ROUTER
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/teams", teamRouter);

// events related outer
app.use("/api/event", eventRouter);
app.use("/api/prize", prizeRouter);
app.use("/api/rounds", roundsRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/leaderboards", leaderboardRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
