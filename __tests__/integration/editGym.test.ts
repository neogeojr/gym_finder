import { PATCH } from "@/app/api/gyms/[gymId]/route";
import type { Types } from "mongoose";
import Gym from "@/models/Gym";
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

const edit = {
  name: "New Name",
  address,
  phone: "555-0100",
  daypass: { available: true, price: 15 },
};

const makeGym = (ownerId: Types.ObjectId) =>
  Gym.create({ ownerId, name: "Old Name", address });

const patch = (gymId: string, body: unknown, cookie?: string) =>
  PATCH(req(`/api/gyms/${gymId}`, { method: "PATCH", body, cookie }), {
    params: Promise.resolve({ gymId }),
  });

describe("PATCH /api/gyms/[gymId]", () => {
  test("The owner can edit their gym. ", async () => {
    const { user, cookie } = await makeUser({ role: "owner" });
    const gym = await makeGym(user._id);
    const res = await patch(String(gym._id), edit, cookie);
    expect(res.status).toBe(200);
    const saved = await Gym.findById(gym._id);
    expect(saved?.name).toBe("New Name");
    expect(saved?.daypass.price).toBe(15);
  });

  test("Another owner gets 403 and the gym is unchanged. ", async () => {
    const { user } = await makeUser({ role: "owner" });
    const other = await makeUser({ role: "owner" });
    const gym = await makeGym(user._id);
    const res = await patch(String(gym._id), edit, other.cookie);
    expect(res.status).toBe(403);
    expect((await Gym.findById(gym._id))?.name).toBe("Old Name");
  });

  test("A guest gets 401", async () => {
    const { user } = await makeUser({ role: "owner" });
    const gym = await makeGym(user._id);
    const res = await patch(String(gym._id), edit);
    expect(res.status).toBe(401);
  });

  test("Bad input gets 400, a bad id gets 404.", async () => {
    const { user, cookie } = await makeUser({ role: "owner" });
    const gym = await makeGym(user._id);
    const bad = await patch(String(gym._id), { ...edit, name: "" }, cookie);
    expect(bad.status).toBe(400);
    const missing = await patch("not-an-id", edit, cookie);
    expect(missing.status).toBe(404);
  });
});
