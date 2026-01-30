import "./config/env.js";
import express from "express";
import cookieParese from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { errorHandle } from "./middleware/error.middleware.js";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/player.route.js";
import organizerRouter from "./routes/organizer.route.js";

// Team Imports
import teamRouter from "./routes/team.route.js";
import notificationRouter from "./routes/notification.route.js";
import invitationRouter from "./routes/invitation.route.js";

// Event Imports
import eventRouter from "./routes/event.route.js";
import roundsRouter from "./routes/event-routes/round.route.js";
import groupsRouter from "./routes/event-routes/group.route.js";
import leaderboardRouter from "./routes/event-routes/leaderboard.route.js";
import { corsOptions } from "./config/corsOptions.js";

const app = express();

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParese());

app.get("/", (req, res) => {
    res.send("This is calling from gaming-hub backend");
});

app.use("/api/auth", authRouter);
app.use("/api/teams", teamRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/organizers", organizerRouter);
app.use("/api/invitations", invitationRouter);
app.use("/api/players", userRouter);

app.use("/api/events", eventRouter);

app.use("/api/rounds", roundsRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/leaderboards", leaderboardRouter);

app.use(errorHandle);

export default app;
