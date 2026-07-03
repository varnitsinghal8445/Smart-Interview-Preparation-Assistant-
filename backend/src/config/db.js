import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-interview-assistant";

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
    return;
  } catch (error) {
    console.warn("Local MongoDB unavailable, starting in-memory database...");
  }

  try {
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log("In-memory MongoDB connected (dev mode)");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};
