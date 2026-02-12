import User from "./user.model.js";
import { CustomError } from "../../shared/utils/CustomError.js";
import { generateTokens, storeRefreshToken, setCookies } from "../auth/auth.service.js";

export const createNewUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

export const findUserByEmail = async (email) => {
  const user = await User.findById({ email });
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  return user;
};

export const findUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  return user;
};

export const getAllUsers = async () => {
  return await User.find();
};
