import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

export const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage"
);

export const discordOAuthConfig = {
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    token_url: "https://discord.com/api/oauth2/token",
    user_url: "https://discord.com/api/users/@me",
};
