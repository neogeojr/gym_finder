import { cleanGymInput } from "@/lib/gymInput";

const valid = {
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

describe("cleanGymInput", () => {
  test("accepts a complete gym", () => {
    expect(cleanGymInput(valid)).toEqual({ data: valid });
  });

  test("trims text", () => {
    const result = cleanGymInput({
      ...valid,
      name: "  Test Gym ",
      address: { ...valid.address, city: " Phoenix " },
    });
    expect(result.data?.name).toBe("Test Gym");
    expect(result.data?.address.city).toBe("Phoenix");
  });

  test("requires a name of at most 120 characters", () => {
    expect(cleanGymInput({ ...valid, name: "   " }).error).toBeDefined();
    expect(
      cleanGymInput({ ...valid, name: "a".repeat(121) }).error,
    ).toBeDefined();
    expect(
      cleanGymInput({ ...valid, name: "a".repeat(120) }).error,
    ).toBeUndefined();
  });

  test("requires the full address", () => {
    expect(
      cleanGymInput({ ...valid, address: { ...valid.address, zipCode: "" } })
        .error,
    ).toBeDefined();
    expect(cleanGymInput({ ...valid, address: undefined }).error).toBeDefined();
  });

  test("the price must be 0 or more, and defaults to 0", () => {
    expect(
      cleanGymInput({ ...valid, daypass: { available: true, price: -1 } })
        .error,
    ).toBeDefined();
    expect(
      cleanGymInput({ ...valid, daypass: { available: true, price: "abc" } })
        .error,
    ).toBeDefined();
    expect(
      cleanGymInput({ ...valid, daypass: { available: false } }).data?.daypass,
    ).toEqual({ available: false, price: 0 });
  });

  test("keeps only the fields an owner may set", () => {
    const result = cleanGymInput({
      ...valid,
      ownerId: "someone-else",
      _id: "abc",
    });
    expect(result.data).not.toHaveProperty("ownerId");
    expect(result.data).not.toHaveProperty("_id");
  });
});
