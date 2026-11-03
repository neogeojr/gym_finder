import bcryptjs from "bcryptjs";
import * as signup from "@/app/api/users/signup/route";
import User from "@/models/User";
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

const doSignup = (payload: unknown) =>
  signup.POST(req("/api/users/signup", { method: "POST", body: payload }));

describe("signup", () => {
  test("creates a regular user with a hashed password", async () => {
    const res = await doSignup({
      email: "sam@test.com",
      password: "password123",
    });
    expect(res.status).toBe(201);

    const user = await User.findOne({ email: "sam@test.com" });
    expect(user?.role).toBe("regular");
    expect(user?.password).not.toBe("password123");
    expect(await bcryptjs.compare("password123", user!.password)).toBe(true);
  });

  test("makes an owner only when asked", async () => {
    await doSignup({
      email: "o@test.com",
      password: "password123",
      role: "owner",
    });
    expect((await User.findOne({ email: "o@test.com" }))?.role).toBe("owner");
  });

  test("never gives any other role", async () => {
    const res = await doSignup({
      email: "evil@test.com",
      password: "password123",
      role: "admin",
    });
    expect(res.status).toBe(201);
    expect((await User.findOne({ email: "evil@test.com" }))?.role).toBe(
      "regular",
    );
  });

  test("rejects a duplicate email with 409", async () => {
    await makeUser({ email: "sam@test.com" });
    const res = await doSignup({
      email: "Sam@Test.com",
      password: "password123",
    });
    expect(res.status).toBe(409);
    expect(await User.countDocuments()).toBe(1);
  });

  test("rejects a bad email or short password with 400", async () => {
    const badEmail = await doSignup({
      email: "nope",
      password: "password123",
    });
    const shortPassword = await doSignup({
      email: "sam@test.com",
      password: "short",
    });
    expect(badEmail.status).toBe(400);
    expect(shortPassword.status).toBe(400);
    expect(await User.countDocuments()).toBe(0);
  });
});
