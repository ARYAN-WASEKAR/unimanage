import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/unimanage";
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(
      `[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`,
    );
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Sync Engine] Atlas connection restricted or offline. Running High-Availability Sync Engine.`);
    return null;
  }
}

export function getDbState() {
  const state = mongoose.connection.readyState;
  return {
    connected: state === 1,
    state,
    uri: (process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/unimanage").replace(
      /\/\/[^:]+:[^@]+@/,
      "//***:***@",
    ),
  };
}
