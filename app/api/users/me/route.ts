import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    return NextResponse.json({ message: "User found", data: user });
  } catch (error) {
    console.error(`Could not load the current user. ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 },
    );
  }
}
