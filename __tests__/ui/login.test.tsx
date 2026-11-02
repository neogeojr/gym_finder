/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { toast } from "react-hot-toast";
import LoginPage from "@/app/login/page";

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

const mockPost = axios.post as jest.Mock;
const mockRefresh = jest.fn();
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ refresh: mockRefresh }),
}));

beforeEach(() => jest.clearAllMocks());

async function logIn() {
  await userEvent.type(screen.getByLabelText("Email"), "sam@test.com");
  await userEvent.type(screen.getByLabelText("Password"), "password123");
  await userEvent.click(screen.getByRole("button", { name: "Log in" }));
}

describe("login page", () => {
  test("The button is disabled until email and password are filled.", async () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: "Log in" });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Email"), "sam@test.com");
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    expect(button).toBeEnabled();
  });

  test.each([
    ["regular", "/search"],
    ["owner", "/owner"],
  ])("a %s goes to %s after refreshing the session", async (role, path) => {
    mockPost.mockResolvedValue({ data: { success: true, role } });
    render(<LoginPage />);
    await logIn();

    expect(mockPost).toHaveBeenCalledWith("/api/users/login", {
      email: "sam@test.com",
      password: "password123",
    });
    expect(mockRefresh).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(path);
  });

  test("A wrong password shows the server message and stays on the page", async () => {
    mockPost.mockRejectedValue({
      response: { status: 401, data: { error: "Invalid email or password." } },
    });
    render(<LoginPage />);
    await logIn();

    expect(toast.error).toHaveBeenCalledWith("Invalid email or password.");
    expect(mockPush).not.toHaveBeenCalled();
  });
});
