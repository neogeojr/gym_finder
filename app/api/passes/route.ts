import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import Gym from "@/models/Gym";
import Pass from "@/models/Pass";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const check = await requireRole(request, ["regular", "owner"]);
    if (!check.ok) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status },
      );
    }

    const passes = await Pass.find({ userId: check.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "gymId", model: Gym, select: "name address" });

    const data = passes.map((pass) => {
      const { gymId, ...rest } = pass.toObject();
      return { ...rest, gym: gymId ?? null };
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error(`Could not load the passes. ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 },
    );
  }
}
