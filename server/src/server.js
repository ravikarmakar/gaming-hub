import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParese from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { errorHandle } from "./middleware/error.middleware.js";
import connectDB from "./config/db.js";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/player.route.js";
import organizerRouter from "./routes/organizer.route.js";

// Team Imports
import teamRouter from "./routes/team.route.js";
import notificationRouter from "./routes/notifications-route/team.notification.route.js";
import invitationRouter from "./routes/team-routes/invitation.route.js";
import joinRequestRouter from "./routes/team-routes/joinRequest.route.js";

// Event Imports
import eventRouter from "./routes/event.route.js";
import prizeRouter from "./routes/event-routes/prize.route.js";
import roundsRouter from "./routes/event-routes/round.route.js";
import groupsRouter from "./routes/event-routes/group.route.js";
import leaderboardRouter from "./routes/event-routes/leaderboard.route.js";
import { corsOptions } from "./config/corsOptions.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors(corsOptions));

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParese());

app.get("/", (req, res) => {
  res.send("This is calling from gaming-hub backend");
});

app.use("/api/auth", authRouter);
app.use("/api/organizers", organizerRouter);
app.use("/api/teams", teamRouter);
app.use("/api/players", userRouter);

app.use("/api/notifications", notificationRouter);
app.use("/api/invitations", invitationRouter);
app.use("/api/join-requests", joinRequestRouter);
app.use("/api/events", eventRouter);
app.use("/api/prize", prizeRouter);
app.use("/api/rounds", roundsRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/leaderboards", leaderboardRouter);

app.use(errorHandle);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  connectDB();
});
