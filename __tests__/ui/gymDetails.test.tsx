/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import axios from "axios";
import GymDetails from "@/app/gyms/[gymId]/GymDetails";

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockGet = axios.get as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("gym details page", () => {
  test("Shows the name, address, phone and day pass. ", async () => {
    mockGet.mockResolvedValue({
      data: {
        data: {
          _id: "g1",
          name: "Iron Works",
          address: {
            street: "1 Main St",
            city: "Phoenix",
            state: "AZ",
            zipCode: "85032",
          },
          phone: "555-0100",
          daypass: { available: true, price: 12 },
        },
      },
    });
    render(<GymDetails gymId="g1" />);

    expect(
      await screen.findByRole("heading", { name: "Iron Works" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 Main St, Phoenix, AZ 85032")).toBeVisible();
    expect(screen.getByText("Phone: 555-0100")).toBeVisible();
    expect(screen.getByText("Day pass $12")).toBeVisible();
    expect(mockGet).toHaveBeenCalledWith("/api/gyms/g1");
  });

  test("Shows Gym not found when it is missing. ", async () => {
    mockGet.mockRejectedValue({ response: { status: 404 } });
    render(<GymDetails gymId="nope" />);
    expect(await screen.findByText("Gym not found.")).toBeInTheDocument();
  });
});
