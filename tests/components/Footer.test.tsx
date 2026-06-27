import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  it("renders the copyright notice", () => {
    render(<Footer />);
    expect(screen.getByText(/© Copyright Heists \d{4}/)).toBeInTheDocument();
  });

  it("displays the current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
