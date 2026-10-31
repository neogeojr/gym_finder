import type { GymInput } from "@/types";

const MAX_NAME_LENGTH = 120;

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

type CleanResult =
  | { data: GymInput; error?: undefined }
  | { data?: undefined; error: string };

// Keeps only the fields an owner may set, so anything else in the request
// (ownerId, for example) is dropped.
export const cleanGymInput = (input: unknown): CleanResult => {
  const body = (input ?? {}) as Record<string, unknown>;

  const name = text(body.name);
  if (!name || name.length > MAX_NAME_LENGTH) {
    return {
      error: `A gym name is required (up to ${MAX_NAME_LENGTH} characters).`,
    };
  }

  const rawAddress = (body.address ?? {}) as Record<string, unknown>;
  const address = {
    street: text(rawAddress.street),
    city: text(rawAddress.city),
    state: text(rawAddress.state),
    zipCode: text(rawAddress.zipCode),
  };
  if (!Object.values(address).every(Boolean)) {
    return { error: "Street, city, state and zip code are required." };
  }

  const rawDaypass = (body.daypass ?? {}) as Record<string, unknown>;
  const price = rawDaypass.price === undefined ? 0 : Number(rawDaypass.price);
  if (!Number.isFinite(price) || price < 0) {
    return { error: "The day pass price must be 0 or more." };
  }

  return {
    data: {
      name,
      address,
      phone: text(body.phone),
      daypass: { available: rawDaypass.available === true, price },
    },
  };
};
