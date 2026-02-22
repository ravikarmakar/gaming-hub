import "./shared/config/env.js";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import express from "express";
import cookieParese from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { stream } from "./shared/utils/logger.js";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import { errorHandle } from "./shared/middleware/error.middleware.js";
import { rateLimiter } from "./shared/middleware/rateLimiter.middleware.js";

import authRouter from "./modules/auth/auth.route.js";
import userRouter from "./modules/user/user.route.js";
import organizerRouter from "./modules/organizer/organizer.route.js";

// Team Imports
import teamRouter from "./modules/team/team.route.js";
import joinRequestRouter from "./modules/join-request/join-request.route.js";
import notificationRouter from "./modules/notification/notification.route.js";
import invitationRouter from "./modules/invitation/invitation.route.js";
import chatRouter from "./modules/chat/chat.route.js";
import adminRouter from "./modules/admin/admin.route.js";

// Event Imports
import { initTeamListeners } from "./modules/team/team.events.js";
import eventRouter from "./modules/event/event.route.js";
import roundsRouter from "./modules/event/routes/round.route.js";
import groupsRouter from "./modules/event/routes/group.route.js";
import leaderboardRouter from "./modules/event/routes/leaderboard.route.js";
import { corsOptions } from "./shared/config/corsOptions.js";

// Initialize Team Event Listeners
initTeamListeners();

// Initialize Sentry
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [
            nodeProfilingIntegration(),
        ],
        // Tracing - Use lower sample rate in production for better performance
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        // Profiles sample rate is relative to tracesSampleRate. 
        // 1.0 is very heavy, reducing to 0.1 for better performance.
        profilesSampleRate: 0.1,
    });
}

const app = express();

app.use(cors(corsOptions));
app.use(morgan("dev", { stream }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParese());

// Trust proxy if we are behind a reverse proxy (e.g. Nginx, Heroku, etc.)
// This is necessary for rate limiting and logging to get the correct client IP.
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
app.use(helmet());
app.use(mongoSanitize());
// Note: xss-clean is deprecated. Helmet provides some XSS protection via CSP.
// Consider using express-xss-sanitizer if additional XSS sanitization is needed.
app.use(hpp());
app.use(rateLimiter({ limit: 300, timer: 15 * 60, key: "global" }));

app.get("/", (req, res) => {
    res.send("This is calling from KRM Esports backend");
});

const v1Router = express.Router();

v1Router.use("/auth", authRouter);
v1Router.use("/teams", teamRouter);
v1Router.use("/teams", joinRequestRouter); // Join request routes (decoupled from team router)
v1Router.use("/teams", chatRouter);
v1Router.use("/notifications", notificationRouter);
v1Router.use("/organizers", organizerRouter);
v1Router.use("/invitations", invitationRouter);
v1Router.use("/players", userRouter);
v1Router.use("/events", eventRouter);
v1Router.use("/rounds", roundsRouter);
v1Router.use("/groups", groupsRouter);
v1Router.use("/leaderboards", leaderboardRouter);
v1Router.use("/admin", adminRouter);

app.use("/api/v1", v1Router);

// Sentry v8+ Error Handler (already setup via setupExpressErrorHandler or can use custom)
// Sentry.setupExpressErrorHandler(app) should be called before other error handlers
if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
}

app.use(errorHandle);

export default app;

