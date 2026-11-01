import mongoose from "mongoose";
import Pass from "@/models/Pass";

const passBase = {
  userId: new mongoose.Types.ObjectId(),
  gymId: new mongoose.Types.ObjectId(),
  code: "ABC123",
  validFrom: new Date("2026-01-01"),
  validTo: new Date("2026-01-02"),
};

describe("Pass model", () => {
  test("A pass with the required fields is valid and starts active", () => {
    const pass = new Pass(passBase);
    expect(pass.validateSync()).toBeUndefined();
    expect(pass.status).toBe("active");
  });

  test("Requires a user, a gym, a code and both dates", () => {
    const error = new Pass({}).validateSync();
    expect(error?.errors.userId).toBeDefined();
    expect(error?.errors.gymId).toBeDefined();
    expect(error?.errors.code).toBeDefined();
    expect(error?.errors.validFrom).toBeDefined();
    expect(error?.errors.validTo).toBeDefined();
  });

  test("Rejects a status that is not active, redeemed or cancelled", () => {
    const error = new Pass({ ...passBase, status: "expired" }).validateSync();
    expect(error?.errors.status).toBeDefined();
  });
});
