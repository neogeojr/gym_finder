import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { cleanGymInput } from "@/lib/gymInput";
import { errorMessage } from "@/lib/errors";
import Gym from "@/models/Gym";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const check = await requireRole(request, ["owner"]);
    if (!check.ok) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status },
      );
    }

    const body = await request.json().catch(() => null);
    const input = cleanGymInput(body);
    if (input.error !== undefined) {
      return NextResponse.json({ error: input.error }, { status: 400 });
    }

    const gym = await Gym.create({ ...input.data, ownerId: check.user._id });

    return NextResponse.json(
      { message: "Gym created.", success: true, data: gym },
      { status: 201 },
    );
  } catch (error) {
    console.error(`Gym create failed. ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 },
    );
  }
}
