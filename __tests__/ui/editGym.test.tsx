/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import EditGym from "@/app/owner/gyms/[gymId]/edit/EditGym";

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), patch: jest.fn() },
}));
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock("react-hot-toast", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockGet = axios.get as jest.Mock;
const mockPatch = axios.patch as jest.Mock;

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
  mockGet.mockResolvedValue({ data: { data: [gym] } });
});

describe("edit gym page", () => {
  test("The form is filled in with the gym. ", async () => {
    render(<EditGym gymId="g1" />);
    expect(await screen.findByLabelText("Gym name")).toHaveValue("Iron Works");
    expect(screen.getByLabelText("City")).toHaveValue("Phoenix");
    expect(screen.getByLabelText("Offers a day pass")).toBeChecked();
    expect(screen.getByLabelText("Price (USD)")).toHaveValue(12);
  });

  test("Saving sends the changes and goes to the dashboard. ", async () => {
    mockPatch.mockResolvedValue({ data: { success: true } });
    render(<EditGym gymId="g1" />);
    const name = await screen.findByLabelText("Gym name");
    await userEvent.clear(name);
    await userEvent.type(name, "Iron Works 2");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mockPatch).toHaveBeenCalledWith(
      "/api/gyms/g1",
      expect.objectContaining({ name: "Iron Works 2" }),
    );
    expect(mockPush).toHaveBeenCalledWith("/owner");
  });

  test("A gym that is not in my list shows not found.", async () => {
    render(<EditGym gymId="someone-elses" />);
    expect(await screen.findByText("Gym not found.")).toBeInTheDocument();
  });
});
