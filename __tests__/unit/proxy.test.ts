import { proxy, config } from "@/proxy";
import { req } from "@/__tests__/helpers/api";

const withCookie = { cookie: "token=abc" };

const redirectTarget = (res: Response) =>
  res.status === 307
    ? new URL(res.headers.get("location") ?? "").pathname
    : null;

const passesThrough = (res: Response) =>
  res.headers.get("x-middleware-next") === "1";

describe("proxy: private pages", () => {
  test.each(["/passes", "/owner", "/owner/gyms/new"])(
    "a visitor with no cookie asking for %s is sent to /login",
    (path) => {
      expect(redirectTarget(proxy(req(path)))).toBe("/login");
    },
  );

  test.each(["/passes", "/owner/gyms/new"])(
    "a visitor with a cookie can open %s",
    (path) => {
      expect(passesThrough(proxy(req(path, withCookie)))).toBe(true);
    },
  );
});

describe("proxy: login and signup pages", () => {
  test.each(["/login", "/signup"])(
    "a visitor with no cookie can open %s",
    (path) => {
      expect(passesThrough(proxy(req(path)))).toBe(true);
    },
  );

  test.each(["/login", "/signup"])(
    "a visitor who is already logged in is sent home from %s",
    (path) => {
      expect(redirectTarget(proxy(req(path, withCookie)))).toBe("/");
    },
  );
});

describe("proxy: matcher", () => {
  test("covers the private and login pages but not home, search or gyms", () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining(["/login", "/signup", "/passes", "/owner/:path*"]),
    );
    expect(config.matcher).not.toContain("/");
    expect(config.matcher).not.toContain("/search");
  });
});
