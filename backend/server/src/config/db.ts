import mongoose from "mongoose";
import { env } from "./env";

export const connectDb = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("Connection string:", env.mongodbUri.substring(0, 40) + "***");

    await mongoose.connect(env.mongodbUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✓ Successfully connected to MongoDB");
    console.log("Database:", mongoose.connection.name);
  } catch (error) {
    console.warn("\n⚠ MongoDB Connection Failed (running in mock mode):");
    console.warn("Error:", (error as any).message);
    console.warn("\nFix: Check your network or IP whitelist in MongoDB Atlas");
    console.warn("Server will continue without database connection for now.\n");
  }
};
