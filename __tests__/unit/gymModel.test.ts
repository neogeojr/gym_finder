import mongoose from "mongoose";
import Gym from "@/models/Gym";

const gymBase = {
  ownerId: new mongoose.Types.ObjectId(),
  name: "Test Gym",
  address: {
    street: "100 Central Ave",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85032",
  },
};

describe("Gym model", () => {
  test("A gym with the required fields is valid", () => {
    expect(new Gym(gymBase).validateSync()).toBeUndefined();
  });

  test("the day pass defaults to unavailable and free", () => {
    const gym = new Gym(gymBase);
    expect(gym.daypass.available).toBe(false);
    expect(gym.daypass.price).toBe(0);
  });

  test("requires an owner, a name and every address field", () => {
    const error = new Gym({}).validateSync();
    expect(error?.errors.ownerId).toBeDefined();
    expect(error?.errors.name).toBeDefined();
    expect(error?.errors["address.street"]).toBeDefined();
    expect(error?.errors["address.city"]).toBeDefined();
    expect(error?.errors["address.state"]).toBeDefined();
    expect(error?.errors["address.zipCode"]).toBeDefined();
  });

  test("rejects a negative day pass price", () => {
    const error = new Gym({
      ...gymBase,
      daypass: { available: true, price: -1 },
    }).validateSync();
    expect(error?.errors["daypass.price"]).toBeDefined();
  });
});
