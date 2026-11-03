import type { QueryFilter } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { cleanGymInput } from "@/lib/gymInput";
import { errorMessage } from "@/lib/errors";
import Gym, { type IGym } from "@/models/Gym";

const MAX_RESULTS = 50;
const MAX_WORDS = 6;

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const q = request.nextUrl.searchParams.get("q") ?? "";
    // "phoenix, az" is two words. Every word has to match the name, city,
    // state or zip code, but different words may match different fields.
    const words = q
      .split(/[\s,]+/)
      .filter(Boolean)
      .slice(0, MAX_WORDS);

    const filter: QueryFilter<IGym> = {};
    if (words.length > 0) {
      filter.$and = words.map((word) => {
        const match = new RegExp(escapeRegex(word), "i");
        return {
          $or: [
            { name: match },
            { "address.city": match },
            { "address.state": match },
            { "address.zipCode": match },
          ],
        };
      });
    }

    const gyms = await Gym.find(filter).sort({ name: 1 }).limit(MAX_RESULTS);

    return NextResponse.json({ data: gyms });
  } catch (error) {
    console.error(`Gym search failed. ${errorMessage(error)}`);
    return NextResponse.json(
      { error: "Something went wrong on the server." },
      { status: 500 },
    );
  }
}

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
