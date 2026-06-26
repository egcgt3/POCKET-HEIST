import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ExpiredHeistCard from "@/components/ExpiredHeistCard";
import ExpiredHeistCardSkeleton from "@/components/ExpiredHeistCardSkeleton";

vi.mock("next/link", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, className, id }: any) => (
    <a href={href} className={className} id={id}>
      {children}
    </a>
  ),
}));

const fixture = {
  id: "heist-2",
  title: "Rob the Vending Machine",
  deadline: new Date(2020, 0, 1),
  assignedToCodename: "SilverFox",
  finalStatus: "success" as const,
};

describe("ExpiredHeistCard", () => {
  it("renders title, deadline, and Mission Complete badge for success", () => {
    render(<ExpiredHeistCard {...fixture} />);
    expect(screen.getByText("Rob the Vending Machine")).toBeInTheDocument();
    expect(screen.getByText("Expired Jan 1, 2020")).toBeInTheDocument();
    expect(screen.getByText("Mission Complete")).toBeInTheDocument();
  });

  it("renders the heist title as a link to the correct path", () => {
    render(<ExpiredHeistCard {...fixture} />);
    const link = screen.getByRole("link", { name: "Rob the Vending Machine" });
    expect(link).toHaveAttribute("href", "/heists/heist-2");
  });

  it("renders Mission Failed badge when finalStatus is failure", () => {
    render(<ExpiredHeistCard {...fixture} finalStatus="failure" />);
    expect(screen.getByText("Mission Failed")).toBeInTheDocument();
  });

  it("falls back to No crew assigned when assignedToCodename is empty", () => {
    render(<ExpiredHeistCard {...fixture} assignedToCodename="" />);
    expect(screen.getByText("No crew assigned")).toBeInTheDocument();
  });

  it("article is labeled by the heist title", () => {
    render(<ExpiredHeistCard {...fixture} />);
    expect(
      screen.getByRole("article", { name: "Rob the Vending Machine" }),
    ).toBeInTheDocument();
  });

  it("announces crew codename with an assigned-to label", () => {
    render(<ExpiredHeistCard {...fixture} />);
    expect(screen.getByText(/assigned to:/i)).toBeInTheDocument();
  });
});

describe("ExpiredHeistCardSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<ExpiredHeistCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("is hidden from the accessibility tree", () => {
    const { container } = render(<ExpiredHeistCardSkeleton />);
    expect(container.querySelector("article")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
