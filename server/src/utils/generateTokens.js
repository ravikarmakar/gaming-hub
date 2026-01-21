import jwt from "jsonwebtoken";
import { redis } from "../config/redisClient.js";

export const generateTokens = (userId, roles) => {
  const accessToken = jwt.sign(
    { userId, roles },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    { userId, roles },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "15d",
    },
  );

  return { accessToken, refreshToken };
};

export const storeRefreshToken = async (userId, refreshToken) => {
  if (!userId || !refreshToken) {
    console.log("NULL VALUE DETECTED IN STORE");
    throw new Error("userId or refreshToken is missing");
  }

  await redis.set(`refresh_token:${userId}`, refreshToken, {
    EX: 15 * 24 * 60 * 60, // 15 days
  });
};

export const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // prevents CSRF attack, cross-site request forgery attack
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // prevents CSRF attack, cross-site request forgery attack
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  });
};
