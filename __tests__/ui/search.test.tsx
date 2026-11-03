/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import SearchClient from "@/app/search/SearchClient";

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
jest.mock("react-hot-toast", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockGet = axios.get as jest.Mock;

const gym = (id: string, name: string, city: string, price = 10) => ({
  _id: id,
  name,
  address: { street: "1 Main St", city, state: "AZ", zipCode: "85032" },
  daypass: { available: true, price },
});

beforeEach(() => jest.clearAllMocks());

describe("search page", () => {
  test("Lists the gyms with a link, address and day pass", async () => {
    mockGet.mockResolvedValue({
      data: { data: [gym("g1", "Iron Works", "Phoenix", 12)] },
    });
    render(<SearchClient initialQ="" />);

    const link = await screen.findByRole("link", { name: /Iron Works/ });
    expect(link).toHaveAttribute("href", "/gyms/g1");
    expect(screen.getByText(/1 Main St, Phoenix, AZ 85032/)).toBeVisible();
    expect(screen.getByText("Day pass $12")).toBeVisible();
    expect(mockGet).toHaveBeenCalledWith("/api/gyms", { params: { q: "" } });
  });

  test("Searching narrows the list by the text typed", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: [gym("g1", "Iron Works", "Phoenix"), gym("g2", "Bay", "Tempe")],
      },
    });
    mockGet.mockResolvedValueOnce({
      data: { data: [gym("g2", "Bay", "Tempe")] },
    });
    render(<SearchClient initialQ="" />);
    await screen.findByText("Iron Works");

    await userEvent.type(screen.getByLabelText("Search gyms"), "tempe");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(mockGet).toHaveBeenLastCalledWith("/api/gyms", {
      params: { q: "tempe" },
    });
    expect(screen.queryByText("Iron Works")).not.toBeInTheDocument();
    expect(screen.getByText("Bay")).toBeInTheDocument();
  });

  test("Shows No gyms found when nothing matches.", async () => {
    mockGet.mockResolvedValue({ data: { data: [] } });
    render(<SearchClient initialQ="zzz" />);
    expect(await screen.findByText("No gyms found.")).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledWith("/api/gyms", { params: { q: "zzz" } });
  });
});
