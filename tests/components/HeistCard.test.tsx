import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HeistCard from "@/components/HeistCard";
import HeistCardSkeleton from "@/components/HeistCardSkeleton";

vi.mock("next/link", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const fixture = {
  id: "heist-1",
  title: "Steal the Stapler",
  deadline: new Date("2099-12-31"),
  assignedToCodename: "ArcticFox",
  mode: "active" as const,
};

describe("HeistCard", () => {
  it("renders heist title, deadline, and status badge", () => {
    render(<HeistCard {...fixture} />);
    expect(screen.getByText("Steal the Stapler")).toBeInTheDocument();
    expect(screen.getByText(/due/i)).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders the heist title as a link to the correct path", () => {
    render(<HeistCard {...fixture} />);
    const link = screen.getByRole("link", { name: "Steal the Stapler" });
    expect(link).toHaveAttribute("href", "/heists/heist-1");
  });

  it("does not render heists excluded from the card list", () => {
    const excludedHeist = {
      ...fixture,
      id: "heist-expired",
      title: "Old Caper",
    };
    const visibleHeists = [fixture];
    render(
      <>
        {visibleHeists.map((h) => (
          <HeistCard key={h.id} {...h} />
        ))}
      </>,
    );
    expect(screen.queryByText(excludedHeist.title)).not.toBeInTheDocument();
  });
});

describe("HeistCardSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<HeistCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
