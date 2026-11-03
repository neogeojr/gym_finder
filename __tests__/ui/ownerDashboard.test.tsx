/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import OwnerDashboardPage from "@/app/owner/page";

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), delete: jest.fn() },
}));
jest.mock("react-hot-toast", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockGet = axios.get as jest.Mock;
const mockDelete = axios.delete as jest.Mock;

const gyms = [
  {
    _id: "g1",
    name: "Iron Works",
    address: {
      street: "1 Main",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85032",
    },
    daypass: { available: true, price: 10 },
  },
  {
    _id: "g2",
    name: "Quiet Yoga",
    address: { street: "2 Main", city: "Tempe", state: "AZ", zipCode: "85281" },
    daypass: { available: false, price: 0 },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue({ data: { data: gyms } });
});

describe("owner dashboard", () => {
  test("Lists my gyms with city, state and day pass .", async () => {
    render(<OwnerDashboardPage />);
    expect(await screen.findByText("Iron Works")).toBeInTheDocument();
    expect(screen.getByText(/Phoenix, AZ - Day pass \$10/)).toBeInTheDocument();
    expect(screen.getByText(/Tempe, AZ - No day pass/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add a gym" })).toHaveAttribute(
      "href",
      "/owner/gyms/new",
    );
  });

  test("Delete asks first, then removes the gym", async () => {
    mockDelete.mockResolvedValue({ data: { success: true } });
    const confirm = jest.spyOn(window, "confirm");
    render(<OwnerDashboardPage />);
    await screen.findByText("Iron Works");
    const [firstDelete] = screen.getAllByRole("button", { name: "Delete" });

    confirm.mockReturnValueOnce(false);
    await userEvent.click(firstDelete);
    expect(mockDelete).not.toHaveBeenCalled();

    confirm.mockReturnValueOnce(true);
    await userEvent.click(firstDelete);
    expect(mockDelete).toHaveBeenCalledWith("/api/gyms/g1");
    expect(screen.queryByText("Iron Works")).not.toBeInTheDocument();
  });
});
