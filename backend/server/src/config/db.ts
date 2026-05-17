import mongoose from "mongoose";
import { env } from "./env";

export const connectDb = async () => {
  try {
    console.log("🔌 Attempting to connect to MongoDB...");
    console.log("📍 URI:", env.mongodbUri.substring(0, 50) + "...");

    const connection = await mongoose.connect(env.mongodbUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000,  // Increased from 5000 to 15000
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,  // Added
      retryWrites: true,  // Added for connection stability
    });

    console.log("✅ Successfully connected to MongoDB");
    console.log("📊 Database:", connection.connection.name);
    console.log("🖥️ MongoDB Host:", connection.connection.host);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ MongoDB Connection Failed:");
    console.error("Error Details:", errorMsg);
    console.error("\n📋 Troubleshooting:");
    console.error("1. Check MongoDB is running (mongod)");
    console.error("2. Verify MONGODB_URI in .env");
    console.error("3. Check network connection");
    console.error("4. For Atlas: Check IP whitelist\n");
    
    // Don't swallow the error - let it propagate
    throw error;
  }
};

