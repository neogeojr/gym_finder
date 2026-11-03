import { POST } from "@/app/api/gyms/route";
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

const validGym = {
  name: "Test Gym",
  address: {
    street: "100 Central Ave",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85032",
  },
  phone: "555-0100",
  daypass: { available: true, price: 10 },
};

describe("POST /api/gyms", () => {
  test("A guest gets 401", async () => {
    const res = await POST(
      req("/api/gyms", { method: "POST", body: validGym }),
    );
    expect(res.status).toBe(401);
  });

  test("A member gets 403", async () => {
    const { cookie } = await makeUser({ role: "regular" });
    const res = await POST(
      req("/api/gyms", { method: "POST", body: validGym, cookie }),
    );
    expect(res.status).toBe(403);
    expect(await Gym.countDocuments()).toBe(0);
  });

  test("An owner creates a gym and is saved as its owner", async () => {
    const { user, cookie } = await makeUser({ role: "owner" });
    const res = await POST(
      req("/api/gyms", { method: "POST", body: validGym, cookie }),
    );
    expect(res.status).toBe(201);
    const { data } = await res.json();
    expect(data.name).toBe("Test Gym");
    expect(String(data.ownerId)).toBe(String(user._id));
  });

  test("Bad input gets 400", async () => {
    const { cookie } = await makeUser({ role: "owner" });
    const res = await POST(
      req("/api/gyms", {
        method: "POST",
        body: { ...validGym, name: "" },
        cookie,
      }),
    );
    expect(res.status).toBe(400);
    expect(await Gym.countDocuments()).toBe(0);
  });

  test("An ownerId in the body is ignored", async () => {
    const { user, cookie } = await makeUser({ role: "owner" });
    const other = await makeUser({ role: "owner" });
    const res = await POST(
      req("/api/gyms", {
        method: "POST",
        body: { ...validGym, ownerId: String(other.user._id) },
        cookie,
      }),
    );
    expect(res.status).toBe(201);
    const gym = await Gym.findOne();
    expect(String(gym?.ownerId)).toBe(String(user._id));
  });
});
