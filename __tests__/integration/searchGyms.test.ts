import { GET } from "@/app/api/gyms/route";
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

const search = async (q?: string) => {
  const res = await GET(
    req(q === undefined ? "/api/gyms" : `/api/gyms?q=${encodeURIComponent(q)}`),
  );
  expect(res.status).toBe(200);
  const { data } = await res.json();
  return data.map((g: { name: string }) => g.name) as string[];
};

async function seed() {
  const { user } = await makeUser({ role: "owner" });
  const make = (name: string, city: string, state: string, zipCode: string) =>
    Gym.create({
      ownerId: user._id,
      name,
      address: { street: "1 Main", city, state, zipCode },
    });
  await make("Iron Works", "Phoenix", "AZ", "85032");
  await make("Bay Fitness", "Oakland", "CA", "94607");
  await make("A.* Club", "Tempe", "AZ", "85281");
}

describe("GET /api/gyms", () => {
  test("An empty search returns every gym, sorted by name. ", async () => {
    await seed();
    expect(await search()).toEqual(["A.* Club", "Bay Fitness", "Iron Works"]);
  });

  test("Matches name, city, state or zip code, ignoring case", async () => {
    await seed();
    expect(await search("iron")).toEqual(["Iron Works"]);
    expect(await search("OAKLAND")).toEqual(["Bay Fitness"]);
    expect(await search("ca")).toEqual(["Bay Fitness"]);
    expect(await search("85281")).toEqual(["A.* Club"]);
  });

  test("Special characters are plain text ", async () => {
    await seed();
    expect(await search(".*")).toEqual(["A.* Club"]);
    expect(await search("(")).toEqual([]);
  });

  test("Returns at most 50 gyms", async () => {
    const { user } = await makeUser({ role: "owner" });
    const address = {
      street: "1 Main",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85032",
    };
    await Gym.insertMany(
      Array.from({ length: 55 }, (_, i) => ({
        ownerId: user._id,
        name: `Gym ${i}`,
        address,
      })),
    );
    expect(await search()).toHaveLength(50);
  });
});
