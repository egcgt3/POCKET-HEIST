import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/AuthContext", () => ({ useUser: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader" />,
}));
vi.mock("@/components/Navbar", () => ({
  default: () => <nav data-testid="navbar" />,
}));

import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/(dashboard)/layout";

const mockReplace = vi.fn();

beforeEach(() => {
  vi.mocked(useRouter).mockReturnValue({ replace: mockReplace } as never);
  mockReplace.mockReset();
});

describe("(dashboard) layout", () => {
  it("renders the loader while auth state is loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true });
    render(<DashboardLayout>content</DashboardLayout>);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("renders the loader and redirects to /login when no user is logged in", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false });
    render(<DashboardLayout>content</DashboardLayout>);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("renders the navbar and children when a user is logged in", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "abc" } as never,
      loading: false,
    });
    render(<DashboardLayout>content</DashboardLayout>);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
