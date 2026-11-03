describe("test setup", () => {
  it("Runs Jest with the test JWT secret", () => {
    expect(process.env.JWT_SECRET).toBe("test-secret");
  });
});
