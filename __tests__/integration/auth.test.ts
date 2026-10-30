import { getUser, requireRole } from "@/lib/auth";
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

describe("getUser", () => {
  test("Returns the logged-in user without the password ", async () => {
    const { user, cookie } = await makeUser();
    const found = await getUser(req("/x", { cookie }));
    expect(String(found?._id)).toBe(String(user._id));
    expect(found?.password).toBeUndefined();
  });

  test("Returns null for a guest or a bad token", async () => {
    expect(await getUser(req("/x"))).toBeNull();
    expect(await getUser(req("/x", { cookie: "token=garbage" }))).toBeNull();
  });
});

describe("requireRole", () => {
  test("a guest gets 401", async () => {
    const result = await requireRole(req("/x"), ["owner"]);
    expect(result).toMatchObject({ ok: false, status: 401 });
  });

  test("The wrong role gets 403", async () => {
    const { cookie } = await makeUser({ role: "regular" });
    const result = await requireRole(req("/x", { cookie }), ["owner"]);
    expect(result).toMatchObject({ ok: false, status: 403 });
  });

  test("The right role passes and returns the user.", async () => {
    const { user, cookie } = await makeUser({ role: "owner" });
    const result = await requireRole(req("/x", { cookie }), ["owner"]);
    expect(result.ok).toBe(true);
    expect(String(result.user?._id)).toBe(String(user._id));
  });
});
