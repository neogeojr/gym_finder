/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { toast } from "react-hot-toast";
import GymDetails from "@/app/gyms/[gymId]/GymDetails";

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock("react-hot-toast", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
let mockUser: { email: string } | null = null;
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockGet = axios.get as jest.Mock;
const mockPost = axios.post as jest.Mock;

const gym = {
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
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = null;
});

describe("gym details page", () => {
  test("Shows the name, address, phone and day pass. ", async () => {
    mockGet.mockResolvedValue({ data: { data: gym } });
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

describe("claiming a day pass", () => {
  test("Success shows the code. ", async () => {
    mockUser = { email: "sam@test.com" };
    mockGet.mockResolvedValue({ data: { data: gym } });
    mockPost.mockResolvedValue({
      data: {
        data: { code: "abc123def456", validFrom: "2026-11-01T07:00:00.000Z" },
      },
    });
    render(<GymDetails gymId="g1" />);

    await userEvent.click(
      await screen.findByRole("button", { name: "Get day pass" }),
    );
    expect(
      await screen.findByText("Your day pass code: abc123def456"),
    ).toBeVisible();
    expect(mockPost).toHaveBeenCalledWith("/api/gyms/g1/passes");
    expect(
      screen.queryByRole("button", { name: "Get day pass" }),
    ).not.toBeInTheDocument();
  });

  test("A guest is sent to login. ", async () => {
    mockGet.mockResolvedValue({ data: { data: gym } });
    render(<GymDetails gymId="g1" />);

    await userEvent.click(
      await screen.findByRole("button", { name: "Get day pass" }),
    );
    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(mockPost).not.toHaveBeenCalled();
  });

  test("A refusal shows the server message. ", async () => {
    mockUser = { email: "sam@test.com" };
    mockGet.mockResolvedValue({ data: { data: gym } });
    mockPost.mockRejectedValue({
      response: {
        data: { error: "You already have a pass for this gym today." },
      },
    });
    render(<GymDetails gymId="g1" />);

    await userEvent.click(
      await screen.findByRole("button", { name: "Get day pass" }),
    );
    expect(toast.error).toHaveBeenCalledWith(
      "You already have a pass for this gym today.",
    );
  });

  test("No button when the gym has no day pass. ", async () => {
    mockGet.mockResolvedValue({
      data: { data: { ...gym, daypass: { available: false, price: 0 } } },
    });
    render(<GymDetails gymId="g1" />);
    await screen.findByRole("heading", { name: "Iron Works" });
    expect(
      screen.queryByRole("button", { name: "Get day pass" }),
    ).not.toBeInTheDocument();
  });
});
