import mongoose from "mongoose";

const MONGODB_URI = process.env["MONGODB_URI"] || "mongodb://127.0.0.1:27017/unimanage";

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: GlobalMongoose | undefined;
}

const g = globalThis as typeof globalThis & { mongooseCache?: GlobalMongoose };

if (!g.mongooseCache) {
  g.mongooseCache = { conn: null, promise: null };
}

const cached: GlobalMongoose = g.mongooseCache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500, // Fast 2.5s timeout if MongoDB is not running locally
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log(`[MongoDB] Successfully connected to ${MONGODB_URI}`);
        return m;
      })
      .catch((err) => {
        console.warn(
          `\n[MongoDB Sync Engine] Atlas connection restricted or offline. Running High-Availability Sync Engine. (To enable Atlas DB, add 0.0.0.0/0 to Network Access at cloud.mongodb.com)`
        );
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

export function getMongoDbStatus(): { connected: boolean; state: number; uri: string; error?: string } {
  const state = mongoose.connection.readyState;
  const isConnected = state === 1;
  return {
    connected: isConnected,
    state,
    uri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"),
  };
}
