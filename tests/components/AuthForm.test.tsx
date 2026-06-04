import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";

// component imports
import AuthForm from "@/components/AuthForm";

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
    it("shows errors and does not log when both fields are empty", async () => {
      const user = userEvent.setup();
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      render(<AuthForm mode="login" />);

      await user.click(screen.getByRole("button", { name: "Log In" }));

      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(logSpy).not.toHaveBeenCalled();
    });

    it("shows only a password error when email is filled", async () => {
      const user = userEvent.setup();
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      render(<AuthForm mode="login" />);

      await user.type(screen.getByLabelText("Email"), "thief@heist.io");
      await user.click(screen.getByRole("button", { name: "Log In" }));

      expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe("successful submission", () => {
    it("logs the email and password when both fields are filled", async () => {
      const user = userEvent.setup();
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      render(<AuthForm mode="login" />);

      await user.type(screen.getByLabelText("Email"), "thief@heist.io");
      await user.type(screen.getByLabelText("Password"), "s3cr3t");
      await user.click(screen.getByRole("button", { name: "Log In" }));

      expect(logSpy).toHaveBeenCalledWith({
        email: "thief@heist.io",
        password: "s3cr3t",
      });
    });
  });
});
