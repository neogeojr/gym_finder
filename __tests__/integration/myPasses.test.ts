import { Types } from "mongoose";
import { GET } from "@/app/api/passes/route";
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

const makePass = (
  userId: Types.ObjectId,
  gymId: Types.ObjectId,
  code: string,
) =>
  Pass.create({
    userId,
    gymId,
    code,
    validFrom: new Date(),
    validTo: new Date(),
  });

describe("GET /api/passes", () => {
  test("A guest gets 401", async () => {
    expect((await GET(req("/api/passes"))).status).toBe(401);
  });

  test("Lists only my passes, newest first, with the gym", async () => {
    const { user } = await makeUser({ role: "owner" });
    const me = await makeUser();
    const other = await makeUser();
    const gym = await Gym.create({
      ownerId: user._id,
      name: "Test Gym",
      address,
    });
    await makePass(me.user._id, gym._id, "FIRST");
    await makePass(other.user._id, gym._id, "NOTMINE");
    await makePass(me.user._id, gym._id, "SECOND");

    const res = await GET(req("/api/passes", { cookie: me.cookie }));
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.map((p: { code: string }) => p.code)).toEqual([
      "SECOND",
      "FIRST",
    ]);
    expect(data[0].gym.name).toBe("Test Gym");
    expect(data[0].gym.address.city).toBe("Phoenix");
  });

  test("The gym is null when it was deleted", async () => {
    const me = await makeUser();
    await makePass(me.user._id, new Types.ObjectId(), "GONE");

    const res = await GET(req("/api/passes", { cookie: me.cookie }));
    const { data } = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].gym).toBeNull();
  });
});
