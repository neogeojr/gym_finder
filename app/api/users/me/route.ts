import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getUser(request);
    if (!user) {
      const response = NextResponse.json(
        { error: "Not logged in." },
        { status: 401 },
      );
      // A cookie that no longer matches a user (expired, or the user was
      // deleted) would keep /login and /signup locked, so clear it.
      if (request.cookies.get("token")) {
        response.cookies.set("token", "", {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 0,
        });
      }
      return response;
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
