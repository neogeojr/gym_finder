/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import axios from "axios";
import MyPassesPage from "@/app/passes/page";

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
jest.mock("react-hot-toast", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockGet = axios.get as jest.Mock;

beforeEach(() => jest.clearAllMocks());

const address = {
  street: "1 Main St",
  city: "Phoenix",
  state: "AZ",
  zipCode: "85032",
};

describe("my passes page", () => {
  test("Lists passes with a gym link, or Removed gym. ", async () => {
    mockGet.mockResolvedValue({
      data: {
        data: [
          {
            _id: "p1",
            code: "abc123",
            validFrom: "2026-11-01T12:00:00.000Z",
            gym: { _id: "g1", name: "Iron Works", address },
          },
          {
            _id: "p2",
            code: "def456",
            validFrom: "2026-10-30T12:00:00.000Z",
            gym: null,
          },
        ],
      },
    });
    render(<MyPassesPage />);

    const link = await screen.findByRole("link", { name: "Iron Works" });
    expect(link).toHaveAttribute("href", "/gyms/g1");
    expect(screen.getByText("Code: abc123")).toBeVisible();
    expect(screen.getByText("Removed gym")).toBeVisible();
    expect(screen.getByText("Code: def456")).toBeVisible();
    expect(mockGet).toHaveBeenCalledWith("/api/passes");
  });

  test("Shows a message when there are no passes. ", async () => {
    mockGet.mockResolvedValue({ data: { data: [] } });
    render(<MyPassesPage />);
    expect(
      await screen.findByText("You have no day passes yet."),
    ).toBeVisible();
  });
});
