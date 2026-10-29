import User from "@/models/User";

const userBase = { email: "a@b.com", password: "hashed-password" };

describe("User model", () => {
  test("fills in the default role", () => {
    const user = new User(userBase);
    expect(user.role).toBe("regular");
  });

  test("lowercases and trims the email", () => {
    const user = new User({ ...userBase, email: "  A@B.com " });
    expect(user.email).toBe("a@b.com");
  });

  test("requires an email and a password", async () => {
    const error = new User({}).validateSync();
    expect(error?.errors.email).toBeDefined();
    expect(error?.errors.password).toBeDefined();
  });

  test("rejects a role that is not regular or owner", async () => {
    const error = new User({ ...userBase, role: "admin" }).validateSync();
    expect(error?.errors.role).toBeDefined();
  });
});
