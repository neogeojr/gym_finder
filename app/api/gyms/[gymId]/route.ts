import mongoose, { type HydratedDocument } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { cleanGymInput } from "@/lib/gymInput";
import { errorMessage } from "@/lib/errors";
import Gym, { type IGym } from "@/models/Gym";
import Pass from "@/models/Pass";

type RouteContext = { params: Promise<{ gymId: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const { gymId } = await params;
    const gym = mongoose.isValidObjectId(gymId)
      ? await Gym.findById(gymId)
      : null;
    if (!gym) {
      return NextResponse.json({ error: "Gym not found. " }, { status: 404 });
    }

    return NextResponse.json({ data: gym });
  } catch (error) {
    console.error(`Could not load the gym. ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 },
    );
  }
}

type OwnedGym =
  | { gym: HydratedDocument<IGym>; response?: undefined }
  | { gym?: undefined; response: NextResponse };

async function findOwnedGym(
  request: NextRequest,
  gymId: string,
): Promise<OwnedGym> {
  const check = await requireRole(request, ["owner"]);
  if (!check.ok) {
    return {
      response: NextResponse.json(
        { error: check.error },
        { status: check.status },
      ),
    };
  }

  const gym = mongoose.isValidObjectId(gymId)
    ? await Gym.findById(gymId)
    : null;
  if (!gym) {
    return {
      response: NextResponse.json({ error: "Gym not found." }, { status: 404 }),
    };
  }
  if (String(gym.ownerId) !== String(check.user._id)) {
    return {
      response: NextResponse.json({ error: "Not allowed." }, { status: 403 }),
    };
  }
  return { gym };
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const { gymId } = await params;
    const found = await findOwnedGym(request, gymId);
    if (found.response) return found.response;

    const body = await request.json().catch(() => null);
    const input = cleanGymInput(body);
    if (input.error !== undefined) {
      return NextResponse.json({ error: input.error }, { status: 400 });
    }

    found.gym.set(input.data);
    await found.gym.save();

    return NextResponse.json({
      message: "Gym updated.",
      success: true,
      data: found.gym,
    });
  } catch (error) {
    console.error(`Gym edit failed. ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const { gymId } = await params;
    const found = await findOwnedGym(request, gymId);
    if (found.response) return found.response;

    await Pass.deleteMany({ gymId: found.gym._id });
    await found.gym.deleteOne();

    return NextResponse.json({ message: "Gym deleted.", success: true });
  } catch (error) {
    console.error(`Gym delete failed. ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 },
    );
  }
}
