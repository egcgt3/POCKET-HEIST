import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { setDoc } from "firebase/firestore";

// component imports
import AuthForm from "@/components/AuthForm";

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({
  setDoc: vi.fn(),
  doc: vi.fn(() => ({})),
}));
vi.mock("@/lib/firebase", () => ({ auth: {}, db: {} }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/generateCodename", () => ({
  generateCodename: () => "SilentOnyxRaven",
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AuthForm", () => {
  describe("login mode", () => {
    it("renders email and password fields", () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByLabelText("Email")).toBeInTheDocument();

      const password = screen.getByLabelText("Password");
      expect(password).toBeInTheDocument();
      expect(password).toHaveAttribute("type", "password");
    });

    it("renders a 'Log In' submit button", () => {
      render(<AuthForm mode="login" />);

      const submit = screen.getByRole("button", { name: "Log In" });
      expect(submit).toBeInTheDocument();
      expect(submit).toHaveAttribute("type", "submit");
    });

    it("renders a link to the signup page", () => {
      render(<AuthForm mode="login" />);

      const link = screen.getByRole("link", { name: /sign up/i });
      expect(link).toHaveAttribute("href", "/signup");
    });
  });

  describe("signup mode", () => {
    it("renders a 'Sign Up' submit button", () => {
      render(<AuthForm mode="signup" />);

      const submit = screen.getByRole("button", { name: "Sign Up" });
      expect(submit).toBeInTheDocument();
    });

    it("renders a link to the login page", () => {
      render(<AuthForm mode="signup" />);

      const link = screen.getByRole("link", { name: /log in/i });
      expect(link).toHaveAttribute("href", "/login");
    });
  });

  describe("password toggle", () => {
    it("toggles the password field between hidden and visible", async () => {
      const user = userEvent.setup();
      render(<AuthForm mode="login" />);

      const password = screen.getByLabelText("Password");
      expect(password).toHaveAttribute("type", "password");

      const toggle = screen.getByRole("button", { name: "Show password" });
      await user.click(toggle);
      expect(password).toHaveAttribute("type", "text");

      const hideToggle = screen.getByRole("button", { name: "Hide password" });
      await user.click(hideToggle);
      expect(password).toHaveAttribute("type", "password");
    });
  });

  describe("validation", () => {
    it("shows errors and does not call Firebase when both fields are empty", async () => {
      const user = userEvent.setup();
      render(<AuthForm mode="login" />);

      await user.click(screen.getByRole("button", { name: "Log In" }));

      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it("shows only a password error when email is filled", async () => {
      const user = userEvent.setup();
      render(<AuthForm mode="login" />);

      await user.type(screen.getByLabelText("Email"), "thief@heist.io");
      await user.click(screen.getByRole("button", { name: "Log In" }));

      expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    });
  });

  describe("login mode — Firebase", () => {
    beforeEach(() => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as never);
    });

    async function submitLogin(email = "thief@heist.io", password = "s3cr3t") {
      const user = userEvent.setup();
      render(<AuthForm mode="login" />);
      await user.type(screen.getByLabelText("Email"), email);
      await user.type(screen.getByLabelText("Password"), password);
      await user.click(screen.getByRole("button", { name: "Log In" }));
    }

    it("calls signInWithEmailAndPassword with the submitted credentials", async () => {
      await submitLogin();
      await waitFor(() =>
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          {},
          "thief@heist.io",
          "s3cr3t",
        ),
      );
    });

    it("shows 'You're logged in!' after successful sign-in", async () => {
      await submitLogin();
      await waitFor(() =>
        expect(screen.getByText("You're logged in!")).toBeInTheDocument(),
      );
    });

    it("clears the email and password fields after success", async () => {
      await submitLogin();
      await waitFor(() => {
        expect(screen.getByLabelText("Email")).toHaveValue("");
        expect(screen.getByLabelText("Password")).toHaveValue("");
      });
    });

    it("disables the submit button while the request is pending", async () => {
      let resolve!: () => void;
      vi.mocked(signInWithEmailAndPassword).mockReturnValueOnce(
        new Promise((res) => {
          resolve = () => res({} as never);
        }),
      );

      const user = userEvent.setup();
      render(<AuthForm mode="login" />);
      await user.type(screen.getByLabelText("Email"), "thief@heist.io");
      await user.type(screen.getByLabelText("Password"), "s3cr3t");

      const btn = screen.getByRole("button", { name: "Log In" });
      await user.click(btn);

      expect(btn).toBeDisabled();

      resolve();
      await waitFor(() => expect(btn).not.toBeDisabled());
    });

    it("shows a friendly error for auth/invalid-credential", async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce({
        code: "auth/invalid-credential",
      });
      await submitLogin();
      await waitFor(() =>
        expect(
          screen.getByText("Incorrect email or password."),
        ).toBeInTheDocument(),
      );
    });

    it("shows a rate-limit error for auth/too-many-requests", async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce({
        code: "auth/too-many-requests",
      });
      await submitLogin();
      await waitFor(() =>
        expect(
          screen.getByText("Too many attempts. Please try again later."),
        ).toBeInTheDocument(),
      );
    });

    it("shows a generic error for an unmapped error code", async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce({
        code: "auth/network-request-failed",
      });
      await submitLogin();
      await waitFor(() =>
        expect(
          screen.getByText("Something went wrong. Please try again."),
        ).toBeInTheDocument(),
      );
    });

    it("does not throw when signInWithEmailAndPassword rejects unexpectedly", async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(
        new Error("unexpected"),
      );
      await expect(submitLogin()).resolves.not.toThrow();
    });
  });

  describe("signup mode — Firebase", () => {
    const fakeUser = { uid: "uid123" };
    const fakeCred = { user: fakeUser };

    beforeEach(() => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(
        fakeCred as never,
      );
      vi.mocked(updateProfile).mockResolvedValue();
      vi.mocked(setDoc).mockResolvedValue();
    });

    async function submitSignup(
      email = "agent@heist.io",
      password = "s3cr3t!",
    ) {
      const user = userEvent.setup();
      render(<AuthForm mode="signup" />);
      await user.type(screen.getByLabelText("Email"), email);
      await user.type(screen.getByLabelText("Password"), password);
      await user.click(screen.getByRole("button", { name: "Sign Up" }));
    }

    it("calls createUserWithEmailAndPassword with the submitted credentials", async () => {
      await submitSignup();
      await waitFor(() =>
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          {},
          "agent@heist.io",
          "s3cr3t!",
        ),
      );
    });

    it("calls updateProfile with the generated codename as displayName", async () => {
      await submitSignup();
      await waitFor(() =>
        expect(updateProfile).toHaveBeenCalledWith(fakeUser, {
          displayName: "SilentOnyxRaven",
        }),
      );
    });

    it("calls setDoc with id and codename but no email field", async () => {
      await submitSignup();
      await waitFor(() => {
        expect(setDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            id: "uid123",
            codename: "SilentOnyxRaven",
          }),
        );
        const docData = vi.mocked(setDoc).mock.calls[0][1] as Record<
          string,
          unknown
        >;
        expect(docData).not.toHaveProperty("email");
      });
    });

    it("shows a friendly error when the email is already in use", async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce({
        code: "auth/email-already-in-use",
      });
      await submitSignup();
      await waitFor(() =>
        expect(
          screen.getByText("An account with this email already exists."),
        ).toBeInTheDocument(),
      );
    });

    it("disables the submit button while the request is pending and re-enables after", async () => {
      let resolve!: () => void;
      vi.mocked(createUserWithEmailAndPassword).mockReturnValueOnce(
        new Promise((res) => {
          resolve = () => res(fakeCred as never);
        }),
      );

      const user = userEvent.setup();
      render(<AuthForm mode="signup" />);
      await user.type(screen.getByLabelText("Email"), "agent@heist.io");
      await user.type(screen.getByLabelText("Password"), "s3cr3t!");

      const btn = screen.getByRole("button", { name: "Sign Up" });
      await user.click(btn);

      expect(btn).toBeDisabled();

      resolve();
      await waitFor(() => expect(btn).not.toBeDisabled());
    });
  });
});
