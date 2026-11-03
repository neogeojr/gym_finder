import * as me from "@/app/api/users/me/route";
import * as logout from "@/app/api/users/logout/route";
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

describe("GET /api/users/me", () => {
  test("returns 401 when nobody is logged in", async () => {
    const res = await me.GET(req("/api/users/me"));
    expect(res.status).toBe(401);
  });

  test("clears a cookie that no longer matches a user", async () => {
    const { user, cookie } = await makeUser();
    await user.deleteOne();

    const res = await me.GET(req("/api/users/me", { cookie }));
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie") ?? "").toMatch(/^token=;.*Max-Age=0/i);
  });

  test("returns the logged-in user without the password", async () => {
    const { cookie } = await makeUser({ email: "sam@test.com" });
    const res = await me.GET(req("/api/users/me", { cookie }));
    expect(res.status).toBe(200);

    const { data } = await res.json();
    expect(data.email).toBe("sam@test.com");
    expect(data.password).toBeUndefined();
  });
});

describe("POST /api/users/logout", () => {
  test("clears the token cookie", async () => {
    const res = await logout.POST();
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/^token=;/);
    expect(setCookie).toMatch(/Max-Age=0/i);
  });
});
