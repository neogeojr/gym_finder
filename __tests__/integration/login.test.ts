import jwt from "jsonwebtoken";
import * as login from "@/app/api/users/login/route";
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

const doLogin = (payload: unknown) =>
  login.POST(req("/api/users/login", { method: "POST", body: payload }));

describe("login", () => {
  test("sets an httpOnly token cookie holding the user id and role", async () => {
    const { user, password } = await makeUser({
      role: "owner",
      email: "sam@test.com",
    });
    const res = await doLogin({ email: "sam@test.com", password });
    expect(res.status).toBe(200);
    expect((await res.json()).role).toBe("owner");

    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/^token=/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=lax/i);

    const token = setCookie.split(";")[0].slice("token=".length);
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as jwt.JwtPayload;
    expect(payload.id).toBe(String(user._id));
    expect(payload.role).toBe("owner");
    expect(payload.exp! - payload.iat!).toBe(60 * 60 * 24);
  });

  test("gives the same 401 for a wrong password and an unknown email", async () => {
    await makeUser({ email: "sam@test.com" });
    const wrong = await doLogin({
      email: "sam@test.com",
      password: "nope-nope",
    });
    const unknown = await doLogin({
      email: "ghost@test.com",
      password: "nope-nope",
    });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect((await wrong.json()).error).toBe((await unknown.json()).error);
    expect(wrong.headers.get("set-cookie")).toBeNull();
  });

  test("rejects missing fields with 400", async () => {
    expect((await doLogin({ email: "sam@test.com" })).status).toBe(400);
    expect((await doLogin({ password: "password123" })).status).toBe(400);
  });
});
