import type { Types } from "mongoose";
import { DELETE } from "@/app/api/gyms/[gymId]/route";
import { GET } from "@/app/api/owner/gyms/route";
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

const makeGym = (ownerId: Types.ObjectId, name = "Test Gym") =>
  Gym.create({ ownerId, name, address });

const remove = (gymId: string, cookie?: string) =>
  DELETE(req(`/api/gyms/${gymId}`, { method: "DELETE", cookie }), {
    params: Promise.resolve({ gymId }),
  });

describe("DELETE /api/gyms/[gymId]", () => {
  test("The owner deletes their gym", async () => {
    const { user, cookie } = await makeUser({ role: "owner" });
    const gym = await makeGym(user._id);
    const res = await remove(String(gym._id), cookie);
    expect(res.status).toBe(200);
    expect(await Gym.countDocuments()).toBe(0);
  });

  test("Deleting a gym also deletes its passes, and only its passes.", async () => {
    const { user, cookie } = await makeUser({ role: "owner" });
    const member = await makeUser();
    const gym = await makeGym(user._id);
    const otherGym = await makeGym(user._id, "Other Gym");
    const pass = (gymId: Types.ObjectId, code: string) => ({
      userId: member.user._id,
      gymId,
      code,
      validFrom: new Date(),
      validTo: new Date(),
    });
    await Pass.create([pass(gym._id, "AAA111"), pass(otherGym._id, "BBB222")]);

    await remove(String(gym._id), cookie);
    const left = await Pass.find();
    expect(left.map((p) => p.code)).toEqual(["BBB222"]);
  });

  test("Another owner gets 403 and the gym stays", async () => {
    const { user } = await makeUser({ role: "owner" });
    const other = await makeUser({ role: "owner" });
    const gym = await makeGym(user._id);
    const res = await remove(String(gym._id), other.cookie);
    expect(res.status).toBe(403);
    expect(await Gym.countDocuments()).toBe(1);
  });
});

describe("GET /api/owner/gyms", () => {
  test("Lists only my gyms, newest first", async () => {
    const { user, cookie } = await makeUser({ role: "owner" });
    const other = await makeUser({ role: "owner" });
    await makeGym(user._id, "First");
    await makeGym(other.user._id, "Not mine");
    await makeGym(user._id, "Second");

    const res = await GET(req("/api/owner/gyms", { cookie }));
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.map((g: { name: string }) => g.name)).toEqual([
      "Second",
      "First",
    ]);
  });

  test("A guest gets 401 and a member gets 403", async () => {
    const { cookie } = await makeUser({ role: "regular" });
    expect((await GET(req("/api/owner/gyms"))).status).toBe(401);
    expect((await GET(req("/api/owner/gyms", { cookie }))).status).toBe(403);
  });
});
