export const discordOAuthConfig = {
  client_id: process.env.DISCORD_CLIENT_ID,
  client_secret: process.env.DISCORD_CLIENT_SECRET,
  redirect_uri: process.env.DISCORD_REDIRECT_URI,
  token_url: "https://discord.com/api/oauth2/token",
  user_url: "https://discord.com/api/users/@me",
};
