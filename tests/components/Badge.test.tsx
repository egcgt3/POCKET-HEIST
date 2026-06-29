import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Badge from "@/components/Badge";

describe("Badge", () => {
  it('renders "Active" for variant active', () => {
    render(<Badge variant="active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it('renders "Assigned" for variant assigned', () => {
    render(<Badge variant="assigned" />);
    expect(screen.getByText("Assigned")).toBeInTheDocument();
  });

  it('renders "Mission Complete" for variant success', () => {
    render(<Badge variant="success" />);
    expect(screen.getByText("Mission Complete")).toBeInTheDocument();
  });

  it('renders "Mission Failed" for variant failure', () => {
    render(<Badge variant="failure" />);
    expect(screen.getByText("Mission Failed")).toBeInTheDocument();
  });

  it("applies the correct data-variant attribute", () => {
    render(<Badge variant="assigned" />);
    expect(screen.getByText("Assigned")).toHaveAttribute(
      "data-variant",
      "assigned",
    );
  });

  it("renders nothing for an unknown variant", () => {
    // @ts-expect-error intentionally passing invalid variant
    const { container } = render(<Badge variant="unknown" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders with a custom aria-label when provided", () => {
    render(<Badge variant="active" ariaLabel="Heist status: active" />);
    expect(screen.getByLabelText("Heist status: active")).toBeInTheDocument();
  });
});
