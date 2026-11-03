import { NextRequest } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { Role } from "@/types";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

let server: MongoMemoryServer | undefined;

export async function startDb() {
  server = await MongoMemoryServer.create();
  process.env.MONGODB_URI = server.getUri();
  process.env.DB_TEST_NAME = "gym_finder_test";
  await connectDB();
}

export async function stopDb() {
  await mongoose.disconnect();
  const cache = (
    globalThis as { mongooseConn?: { conn: unknown; promise: unknown } }
  ).mongooseConn;
  if (cache) {
    cache.conn = null;
    cache.promise = null;
  }
  await server?.stop();
}

export async function clearDb() {
  if (mongoose.connection.readyState !== 1) return;
  await Promise.all(
    Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})),
  );
}

interface ReqOptions {
  method?: string;
  body?: unknown;
  cookie?: string;
}

export function req(
  path: string,
  { method = "GET", body, cookie }: ReqOptions = {},
) {
  const headers = new Headers();
  if (cookie) headers.set("cookie", cookie);
  if (body !== undefined) headers.set("content-type", "application/json");
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

let counter = 0;

interface MakeUserOptions {
  role?: Role;
  email?: string;
  password?: string;
}

export async function makeUser({
  role = "regular",
  email,
  password = "password123",
}: MakeUserOptions = {}) {
  counter += 1;
  const user = await User.create({
    email: email || `user${counter}@test.com`,
    password: await bcryptjs.hash(password, 4),
    role,
  });
  const token = jwt.sign(
    { id: user._id, role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" },
  );
  return { user, cookie: `token=${token}`, password };
}
