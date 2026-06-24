import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/AuthContext", () => ({ useUser: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader" />,
}));

import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import PublicLayout from "@/app/(public)/layout";

const mockReplace = vi.fn();

beforeEach(() => {
  vi.mocked(useRouter).mockReturnValue({ replace: mockReplace } as never);
  mockReplace.mockReset();
});

describe("(public) layout", () => {
  it("renders the loader while auth state is loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true });
    render(<PublicLayout>content</PublicLayout>);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("renders the loader and redirects to /heists when a user is logged in", async () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "abc" } as never,
      loading: false,
    });
    render(<PublicLayout>content</PublicLayout>);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/heists");
  });

  it("renders children when no user is logged in", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false });
    render(<PublicLayout>content</PublicLayout>);
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
