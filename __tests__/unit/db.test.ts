import mongoose from "mongoose";
import { connectDB } from "@/lib/db";

function resetCache() {
  const cache = (
    globalThis as { mongooseConn?: { conn: unknown; promise: unknown } }
  ).mongooseConn;
  if (cache) {
    cache.conn = null;
    cache.promise = null;
  }
}

describe("connectDB", () => {
  const original = { ...process.env };
  let connect: jest.SpyInstance;

  beforeEach(() => {
    resetCache();
    connect = jest.spyOn(mongoose, "connect").mockResolvedValue(mongoose);
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017";
    process.env.DB_NAME = "gym_finder";
    process.env.DB_TEST_NAME = "gym_finder_test";
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = { ...original };
  });

  test("throws when MONGODB_URI is missing", async () => {
    delete process.env.MONGODB_URI;
    await expect(connectDB()).rejects.toThrow(/MONGODB_URI/);
    expect(connect).not.toHaveBeenCalled();
  });

  test("uses DB_TEST_NAME when running tests", async () => {
    // Jest sets NODE_ENV to "test"
    await connectDB();
    expect(connect).toHaveBeenCalledWith("mongodb://127.0.0.1:27017", {
      dbName: "gym_finder_test",
    });
  });

  test("reuses the connection instead of connecting again", async () => {
    await connectDB();
    await connectDB();
    expect(connect).toHaveBeenCalledTimes(1);
  });
});
