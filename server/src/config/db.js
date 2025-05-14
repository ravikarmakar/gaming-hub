import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_PRODUCTION_URI
    : process.env.MONGO_URI;

console.log(DATABASE_URI);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DATABASE_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;
