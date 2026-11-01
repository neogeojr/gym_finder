import mongoose from "mongoose";
import { GET } from "@/app/api/gyms/[gymId]/route";
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

const getGym = (gymId: string) =>
  GET(req(`/api/gyms/${gymId}`), { params: Promise.resolve({ gymId }) });

describe("GET /api/gyms/[gymId]", () => {
  test("Returns the gym to anyone, even a guest. ", async () => {
    const { user } = await makeUser({ role: "owner" });
    const gym = await Gym.create({
      ownerId: user._id,
      name: "Iron Works",
      address: {
        street: "1 Main",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85032",
      },
    });
    const res = await getGym(String(gym._id));
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.name).toBe("Iron Works");
  });

  test("An unknown id gets 404", async () => {
    const res = await getGym(String(new mongoose.Types.ObjectId()));
    expect(res.status).toBe(404);
  });

  test("A malformed id gets 404", async () => {
    const res = await getGym("not-an-id");
    expect(res.status).toBe(404);
  });
});
