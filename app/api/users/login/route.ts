import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { cleanEmail } from "@/lib/validate";
import { errorMessage } from "@/lib/errors";
import User from "@/models/User";

const ONE_DAY_SECONDS = 60 * 60 * 24;

const BAD_LOGIN = "Invalid email or password.";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);
    const email = cleanEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcryptjs.compare(password, user.password))) {
      return NextResponse.json({ error: BAD_LOGIN }, { status: 401 });
    }

    if (!process.env.JWT_SECRET)
      throw new Error("JWT_SECRET is not configured.");
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const response = NextResponse.json({
      message: "Login successful.",
      success: true,
      role: user.role,
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_DAY_SECONDS,
    });
    return response;
  } catch (error) {
    console.error(`Login failed. ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 },
    );
  }
}
