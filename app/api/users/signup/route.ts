import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { connectDB } from "@/lib/db";
import { cleanEmail, validateEmail, validatePassword } from "@/lib/validate";
import { errorMessage } from "@/lib/errors";
import User from "@/models/User";

const DUPLICATE_EMAIL = "An account with that email already exists.";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);
    const email = cleanEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";

    const problem = validateEmail(email) ?? validatePassword(password);
    if (problem) {
      return NextResponse.json({ error: problem }, { status: 400 });
    }

    if (await User.exists({ email })) {
      return NextResponse.json({ error: DUPLICATE_EMAIL }, { status: 409 });
    }

    await User.create({
      email,
      password: await bcryptjs.hash(password, 10),
      role: body.role === "owner" ? "owner" : "regular",
    });

    return NextResponse.json(
      { message: "User created successfully.", success: true },
      { status: 201 },
    );
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: DUPLICATE_EMAIL }, { status: 409 });
    }
    console.error(`Signup failed. ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 },
    );
  }
}
