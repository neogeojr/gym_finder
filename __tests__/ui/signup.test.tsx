/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { toast } from "react-hot-toast";
import SignupPage from "@/app/signup/page";

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

async function fillIn(email: string, password: string) {
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.type(screen.getByLabelText(/^Password/), password);
}

describe("signup page", () => {
  test("the button is disabled until email and password are filled", async () => {
    render(<SignupPage />);
    const button = screen.getByRole("button", { name: "Sign up" });
    expect(button).toBeDisabled();

    await fillIn("sam@test.com", "password123");
    expect(button).toBeEnabled();
  });

  test("sends a member payload and goes to /login", async () => {
    mockPost.mockResolvedValue({ data: { success: true } });
    render(<SignupPage />);
    await fillIn("sam@test.com", "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(mockPost).toHaveBeenCalledWith("/api/users/signup", {
      email: "sam@test.com",
      password: "password123",
      role: "regular",
    });
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  test("sends an owner payload when gym owner is chosen", async () => {
    mockPost.mockResolvedValue({ data: { success: true } });
    render(<SignupPage />);
    await fillIn("olive@test.com", "password123");
    await userEvent.selectOptions(screen.getByLabelText("I am a"), "owner");
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(mockPost).toHaveBeenCalledWith("/api/users/signup", {
      email: "olive@test.com",
      password: "password123",
      role: "owner",
    });
  });

  test("shows a server error as a toast and stays on the page", async () => {
    mockPost.mockRejectedValue({
      response: {
        status: 409,
        data: { error: "An account with that email already exists." },
      },
    });
    render(<SignupPage />);
    await fillIn("sam@test.com", "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(toast.error).toHaveBeenCalledWith(
      "An account with that email already exists.",
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
