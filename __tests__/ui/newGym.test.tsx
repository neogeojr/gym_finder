/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { toast } from "react-hot-toast";
import NewGymPage from "@/app/owner/gyms/new/page";

jest.mock("axios", () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock("react-hot-toast", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockPost = axios.post as jest.Mock;

beforeEach(() => jest.clearAllMocks());

async function fillAndSave() {
  await userEvent.type(screen.getByLabelText("Gym name"), "Iron Works");
  await userEvent.type(screen.getByLabelText("Street"), "1 Main St");
  await userEvent.type(screen.getByLabelText("City"), "Phoenix");
  await userEvent.type(screen.getByLabelText("State"), "AZ");
  await userEvent.type(screen.getByLabelText("Zip code"), "85032");
  await userEvent.click(screen.getByLabelText("Offers a day pass"));
  await userEvent.type(screen.getByLabelText("Price (USD)"), "12");
  await userEvent.click(screen.getByRole("button", { name: "Save gym" }));
}

describe("add gym page", () => {
  test("The price box only appears when the gym offers a day pass ", async () => {
    render(<NewGymPage />);
    expect(screen.queryByLabelText("Price (USD)")).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("Offers a day pass"));
    expect(screen.getByLabelText("Price (USD)")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("Offers a day pass"));
    expect(screen.queryByLabelText("Price (USD)")).not.toBeInTheDocument();
  });

  test("Saving sends the gym and goes back to the dashboard.", async () => {
    mockPost.mockResolvedValue({ data: { success: true } });
    render(<NewGymPage />);
    await fillAndSave();

    expect(mockPost).toHaveBeenCalledWith("/api/gyms", {
      name: "Iron Works",
      address: {
        street: "1 Main St",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85032",
      },
      phone: "",
      daypass: { available: true, price: 12 },
    });
    expect(mockPush).toHaveBeenCalledWith("/owner");
  });

  test("A server error shows its message and stays on the form", async () => {
    mockPost.mockRejectedValue({
      response: { status: 400, data: { error: "A gym name is required." } },
    });
    render(<NewGymPage />);
    await fillAndSave();

    expect(toast.error).toHaveBeenCalledWith("A gym name is required.");
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Gym name")).toHaveValue("Iron Works");
  });
});
