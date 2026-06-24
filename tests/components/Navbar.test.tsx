import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { signOut } from "firebase/auth";

import Navbar from "@/components/Navbar";

vi.mock("@/lib/AuthContext", () => ({
  useUser: vi.fn(),
}));
vi.mock("firebase/auth", () => ({ signOut: vi.fn() }));
vi.mock("@/lib/firebase", () => ({ auth: {} }));

import { useUser } from "@/lib/AuthContext";

afterEach(() => vi.restoreAllMocks());

describe("Navbar", () => {
  it("renders the main heading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false });
    render(<Navbar />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("renders the Create Heist link", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false });
    render(<Navbar />);

    const createLink = screen.getByRole("link", { name: /create heist/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute("href", "/heists/create");
  });

  describe("logout button", () => {
    const fakeUser = { uid: "uid123" } as never;

    beforeEach(() => {
      vi.mocked(signOut).mockResolvedValue();
    });

    it("renders when a user is logged in", () => {
      vi.mocked(useUser).mockReturnValue({ user: fakeUser, loading: false });
      render(<Navbar />);
      expect(
        screen.getByRole("button", { name: "Log Out" }),
      ).toBeInTheDocument();
    });

    it("does not render when no user is logged in", () => {
      vi.mocked(useUser).mockReturnValue({ user: null, loading: false });
      render(<Navbar />);
      expect(
        screen.queryByRole("button", { name: "Log Out" }),
      ).not.toBeInTheDocument();
    });

    it("does not render while auth state is loading", () => {
      vi.mocked(useUser).mockReturnValue({ user: fakeUser, loading: true });
      render(<Navbar />);
      expect(
        screen.queryByRole("button", { name: "Log Out" }),
      ).not.toBeInTheDocument();
    });

    it("calls signOut with the auth instance when clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(useUser).mockReturnValue({ user: fakeUser, loading: false });
      render(<Navbar />);
      await user.click(screen.getByRole("button", { name: "Log Out" }));
      expect(signOut).toHaveBeenCalledWith({});
    });

    it("does not throw when signOut rejects", async () => {
      const user = userEvent.setup();
      vi.mocked(signOut).mockRejectedValueOnce(new Error("network error"));
      vi.mocked(useUser).mockReturnValue({ user: fakeUser, loading: false });
      render(<Navbar />);
      await expect(
        user.click(screen.getByRole("button", { name: "Log Out" })),
      ).resolves.not.toThrow();
    });
  });
});
