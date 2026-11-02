/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => jest.clearAllMocks());

describe("home page", () => {
  test("Submitting the search goes to the encoded search address.", async () => {
    render(<Home />);
    await userEvent.type(
      screen.getByLabelText("Search gyms"),
      " iron & works ",
    );
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(mockPush).toHaveBeenCalledWith("/search?q=iron%20%26%20works");
  });
});
