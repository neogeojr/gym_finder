import type { Types } from "mongoose";
import { POST } from "@/app/api/gyms/[gymId]/passes/route";
import Gym from "@/models/Gym";
import Pass from "@/models/Pass";
import {
  startDb,
  stopDb,
  clearDb,
  req,
  makeUser,
} from "@/__tests__/helpers/api";

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const address = {
  street: "100 Central Ave",
  city: "Phoenix",
  state: "AZ",
  zipCode: "85032",
};

const makeGym = (ownerId: Types.ObjectId, available = true) =>
  Gym.create({ ownerId, name: "Test Gym", address, daypass: { available } });

const claim = (gymId: string, cookie?: string) =>
  POST(req(`/api/gyms/${gymId}/passes`, { method: "POST", cookie }), {
    params: Promise.resolve({ gymId }),
  });

describe("POST /api/gyms/[gymId]/passes", () => {
  test("A guest gets 401", async () => {
    const { user } = await makeUser({ role: "owner" });
    const gym = await makeGym(user._id);
    expect((await claim(String(gym._id))).status).toBe(401);
  });

  test("A gym with no day pass gets 400", async () => {
    const { user } = await makeUser({ role: "owner" });
    const member = await makeUser();
    const gym = await makeGym(user._id, false);
    const res = await claim(String(gym._id), member.cookie);
    expect(res.status).toBe(400);
    expect(await Pass.countDocuments()).toBe(0);
  });

  test("A member claims a pass that is good for today", async () => {
    const { user } = await makeUser({ role: "owner" });
    const member = await makeUser();
    const gym = await makeGym(user._id);
    const res = await claim(String(gym._id), member.cookie);
    expect(res.status).toBe(201);

    const { data } = await res.json();
    expect(data.code).toBeTruthy();
    expect(String(data.userId)).toBe(String(member.user._id));
    const now = Date.now();
    expect(new Date(data.validFrom).getTime()).toBeLessThanOrEqual(now);
    expect(new Date(data.validTo).getTime()).toBeGreaterThan(now);
  });

  test("A second claim for the same gym today gets 409", async () => {
    const { user } = await makeUser({ role: "owner" });
    const member = await makeUser();
    const gym = await makeGym(user._id);
    await claim(String(gym._id), member.cookie);
    const again = await claim(String(gym._id), member.cookie);
    expect(again.status).toBe(409);
    expect(await Pass.countDocuments()).toBe(1);
  });
});
