import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import Gym from "@/models/Gym";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const check = await requireRole(request, ["owner"]);
    if (!check.ok) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status },
      );
    }

    const gyms = await Gym.find({ ownerId: check.user._id }).sort({
      createdAt: -1,
    });
    return NextResponse.json({ data: gyms });
  } catch (error) {
    console.error(`Could not load the owner's gyms. ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 },
    );
  }
}
