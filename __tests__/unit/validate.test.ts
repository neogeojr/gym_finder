import { cleanEmail, validateEmail, validatePassword } from "@/lib/validate";

describe("cleanEmail", () => {
  test("trims and lowercases a string", () => {
    expect(cleanEmail("  ABC@DE.com ")).toBe("abc@de.com");
  });

  test("returns an empty string for a non-string", () => {
    expect(cleanEmail(42)).toBe("");
    expect(cleanEmail(undefined)).toBe("");
  });
});

describe("validateEmail", () => {
  test("accepts a normal address", () => {
    expect(validateEmail("a@b.com")).toBeNull();
  });

  test("rejects a bad address", () => {
    expect(validateEmail("not-an-email")).toBe("Enter a valid email address.");
    expect(validateEmail("a@b")).not.toBeNull();
    expect(validateEmail("")).not.toBeNull();
  });
});

describe("validatePassword", () => {
  test("accepts 8 to 50 characters", () => {
    expect(validatePassword("a".repeat(8))).toBeNull();
    expect(validatePassword("a".repeat(50))).toBeNull();
  });

  test("rejects fewer than 8 or more than 50", () => {
    expect(validatePassword("a".repeat(7))).not.toBeNull();
    expect(validatePassword("a".repeat(51))).not.toBeNull();
  });
});
