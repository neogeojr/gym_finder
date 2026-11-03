import { passDate } from "@/lib/passDate";

describe("passDate", () => {
  test("Shows the day the server counted, whatever the visitor's time zone", () => {
    // 5 pm the evening before in Phoenix, but already the next day on the server.
    expect(passDate("2026-11-03T00:00:00.000Z")).toBe(
      new Date(2026, 10, 3).toLocaleDateString(),
    );
  });
});
