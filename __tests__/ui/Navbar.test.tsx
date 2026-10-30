/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

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

const mockGet = axios.get as jest.Mock;
const mockPost = axios.post as jest.Mock;

const member = { _id: "1", email: "sam@test.com", role: "regular" };
const owner = { _id: "2", email: "olive@test.com", role: "owner" };

const renderNavbar = () =>
  render(
    <AuthProvider>
      <Navbar />
    </AuthProvider>,
  );

beforeEach(() => jest.clearAllMocks());

describe("Navbar", () => {
  test("a guest sees Login and Sign up", async () => {
    mockGet.mockRejectedValue({ response: { status: 401 } });
    renderNavbar();

    expect(await screen.findByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/signup",
    );
    expect(screen.queryByRole("button", { name: "Logout" })).toBeNull();
  });

  test("a member sees My passes, their email and Logout, but not My gyms", async () => {
    mockGet.mockResolvedValue({ data: { data: member } });
    renderNavbar();

    expect(await screen.findByText("sam@test.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My passes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "My gyms" })).toBeNull();
  });

  test("an owner also sees My gyms", async () => {
    mockGet.mockResolvedValue({ data: { data: owner } });
    renderNavbar();

    expect(await screen.findByRole("link", { name: "My gyms" })).toHaveAttribute(
      "href",
      "/owner",
    );
  });

  test("logging out shows Login again and goes to /login", async () => {
    mockGet.mockResolvedValue({ data: { data: member } });
    mockPost.mockResolvedValue({ data: { success: true } });
    renderNavbar();

    await userEvent.click(
      await screen.findByRole("button", { name: "Logout" }),
    );

    expect(await screen.findByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(mockPost).toHaveBeenCalledWith("/api/users/logout");
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
