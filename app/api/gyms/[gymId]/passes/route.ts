import crypto from "crypto";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import Gym from "@/models/Gym";
import Pass from "@/models/Pass";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type RouteContext = { params: Promise<{ gymId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const check = await requireRole(request, ["regular", "owner"]);
    if (!check.ok) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status },
      );
    }

    const { gymId } = await params;
    const gym = mongoose.isValidObjectId(gymId)
      ? await Gym.findById(gymId)
      : null;
    if (!gym) {
      return NextResponse.json({ error: "Gym not found." }, { status: 404 });
    }
    if (!gym.daypass.available) {
      return NextResponse.json(
        { error: "This gym does not offer day passes." },
        { status: 400 },
      );
    }

    const validFrom = new Date();
    validFrom.setHours(0, 0, 0, 0);
    const validTo = new Date(validFrom.getTime() + ONE_DAY_MS);

    const existing = await Pass.exists({
      userId: check.user._id,
      gymId: gym._id,
      validFrom,
      status: "active",
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already have a pass for this gym today. " },
        { status: 409 },
      );
    }

    const pass = await Pass.create({
      userId: check.user._id,
      gymId: gym._id,
      code: crypto.randomBytes(8).toString("hex"),
      validFrom,
      validTo,
    });

    return NextResponse.json(
      { message: "Day pass claimed.", success: true, data: pass },
      { status: 201 },
    );
  } catch (error) {
    console.error(`Day pass claim failed. ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 },
    );
  }
}
