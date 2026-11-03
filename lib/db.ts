import mongoose from "mongoose";
import { errorMessage } from "./errors";

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithCache = globalThis as typeof globalThis & {
  mongooseConn?: Cache;
};
const cached: Cache =
  globalWithCache.mongooseConn ??
  (globalWithCache.mongooseConn = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI is not configured.");

  const dbName =
    process.env.NODE_ENV === "test"
      ? process.env.DB_TEST_NAME
      : process.env.DB_NAME;

  try {
    if (!cached.promise)
      cached.promise = mongoose.connect(process.env.MONGODB_URI, { dbName });
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.log(
      `MongoDB connection error. Verify that MongoDB is running. ${errorMessage(error)}`,
    );
    throw error;
  }
}
