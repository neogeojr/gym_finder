/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { AuthProvider, useAuth } from "@/context/AuthContext";

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const mockGet = axios.get as jest.Mock;
const mockPost = axios.post as jest.Mock;

const sam = { _id: "1", email: "sam@test.com", role: "regular" };

beforeEach(() => jest.clearAllMocks());

function Probe() {
  const { user, loading, logout } = useAuth();
  return (
    <div>
      <p>{loading ? "loading" : user ? `user:${user.email}` : "guest"}</p>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  test("asks the server once and shares the user with every component", async () => {
    mockGet.mockResolvedValue({ data: { data: sam } });
    render(
      <AuthProvider>
        <Probe />
        <Probe />
      </AuthProvider>,
    );

    expect(await screen.findAllByText("user:sam@test.com")).toHaveLength(2);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  test("a 401 means guest", async () => {
    mockGet.mockRejectedValue({ response: { status: 401 } });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(await screen.findByText("guest")).toBeInTheDocument();
  });

  test("logout clears the user", async () => {
    mockGet.mockResolvedValue({ data: { data: sam } });
    mockPost.mockResolvedValue({ data: { success: true } });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await screen.findByText("user:sam@test.com");

    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    expect(await screen.findByText("guest")).toBeInTheDocument();
    expect(mockPost).toHaveBeenCalledWith("/api/users/logout");
  });
});
