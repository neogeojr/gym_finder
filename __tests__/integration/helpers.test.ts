import jwt from "jsonwebtoken";
import User from "@/models/User";
import {
  startDb,
  stopDb,
  clearDb,
  makeUser,
  req,
} from "@/__tests__/helpers/api";

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe("API test helpers", () => {
  test("makeUser saves a user that can be read back", async () => {
    const { user } = await makeUser({ role: "owner", email: "owner@test.com" });

    const found = await User.findById(user._id);
    expect(found?.email).toBe("owner@test.com");
    expect(found?.role).toBe("owner");
  });

  test("makeUser returns a cookie holding a valid token", async () => {
    const { user, cookie } = await makeUser();

    const token = cookie.replace("token=", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
    };
    expect(payload.id).toBe(String(user._id));
    expect(payload.role).toBe("regular");
  });

  test("clearDb empties the database between tests", async () => {
    expect(await User.countDocuments()).toBe(0);
  });

  test("req builds a request with a method, body and cookie", async () => {
    const request = req("/api/anything", {
      method: "POST",
      body: { a: 1 },
      cookie: "token=abc",
    });

    expect(request.method).toBe("POST");
    expect(request.cookies.get("token")?.value).toBe("abc");
    expect(await request.json()).toEqual({ a: 1 });
  });
});
