import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { addDoc, getDocs, serverTimestamp } from "firebase/firestore";

import CreateHeistForm from "@/components/CreateHeistForm";

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => ({ withConverter: vi.fn(() => ({})) })),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => ({ type: "serverTimestamp" })),
}));
vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("@/lib/AuthContext", () => ({ useUser: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

const fakeUser = { uid: "creator-uid", displayName: "SilentOnyxRaven" };
const fakeUsers = [
  { id: "uid-b", data: () => ({ codename: "BoldCopper" }) },
  { id: "uid-a", data: () => ({ codename: "ArcticFox" }) },
];

const mockPush = vi.fn();

beforeEach(() => {
  vi.mocked(useUser).mockReturnValue({
    user: fakeUser as never,
    loading: false,
  });
  vi.mocked(useRouter).mockReturnValue({ push: mockPush } as never);
  vi.mocked(getDocs).mockResolvedValue({ docs: fakeUsers } as never);
  vi.mocked(addDoc).mockResolvedValue({} as never);
  mockPush.mockReset();
});

afterEach(() => vi.clearAllMocks());

async function renderAndWaitForUsers() {
  render(<CreateHeistForm />);
  await waitFor(() =>
    expect(screen.queryByText("Loading agents…")).not.toBeInTheDocument(),
  );
}

describe("CreateHeistForm", () => {
  it("renders title, description, and assignee fields", async () => {
    await renderAndWaitForUsers();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Assign to")).toBeInTheDocument();
  });

  it("populates the assignee dropdown sorted alphabetically, excluding current user", async () => {
    await renderAndWaitForUsers();
    const options = screen.getAllByRole("option");
    const codenames = options.map((o) => o.textContent);
    expect(codenames).toContain("ArcticFox");
    expect(codenames).toContain("BoldCopper");
    const arcticIdx = codenames.indexOf("ArcticFox");
    const boldIdx = codenames.indexOf("BoldCopper");
    expect(arcticIdx).toBeLessThan(boldIdx);
    expect(codenames).not.toContain("SilentOnyxRaven");
  });

  it("shows 'No agents available' when no other users exist", async () => {
    vi.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as never);
    render(<CreateHeistForm />);
    await waitFor(() =>
      expect(screen.getByText("No agents available")).toBeInTheDocument(),
    );
  });

  it("shows validation errors and does not call addDoc when fields are empty", async () => {
    const user = userEvent.setup();
    await renderAndWaitForUsers();
    await user.click(screen.getByRole("button", { name: "Launch Heist" }));
    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("Please select an assignee")).toBeInTheDocument();
    expect(addDoc).not.toHaveBeenCalled();
  });

  it("calls addDoc with the correct CreateHeistInput shape on valid submission", async () => {
    const user = userEvent.setup();
    await renderAndWaitForUsers();

    await user.type(screen.getByLabelText("Title"), "Steal the Stapler");
    await user.type(
      screen.getByLabelText("Description"),
      "Get the red one from Jim.",
    );
    await user.selectOptions(screen.getByLabelText("Assign to"), "uid-a");
    await user.click(screen.getByRole("button", { name: "Launch Heist" }));

    await waitFor(() => expect(addDoc).toHaveBeenCalledOnce());

    const submitted = vi.mocked(addDoc).mock.calls[0][1] as Record<
      string,
      unknown
    >;
    expect(submitted.title).toBe("Steal the Stapler");
    expect(submitted.description).toBe("Get the red one from Jim.");
    expect(submitted.createdBy).toBe("creator-uid");
    expect(submitted.createdByCodename).toBe("SilentOnyxRaven");
    expect(submitted.assignedTo).toBe("uid-a");
    expect(submitted.assignedToCodename).toBe("ArcticFox");
    expect(submitted.finalStatus).toBeNull();
    expect(submitted.createdAt).toEqual({ type: "serverTimestamp" });
  });

  it("sets deadline to approximately 48 hours from now", async () => {
    const user = userEvent.setup();
    const before = Date.now();
    await renderAndWaitForUsers();

    await user.type(screen.getByLabelText("Title"), "Steal the Stapler");
    await user.type(screen.getByLabelText("Description"), "Get the red one.");
    await user.selectOptions(screen.getByLabelText("Assign to"), "uid-a");
    await user.click(screen.getByRole("button", { name: "Launch Heist" }));

    await waitFor(() => expect(addDoc).toHaveBeenCalledOnce());
    const submitted = vi.mocked(addDoc).mock.calls[0][1] as Record<
      string,
      unknown
    >;
    const deadline = submitted.deadline as Date;
    const expected = before + 48 * 60 * 60 * 1000;
    expect(deadline.getTime()).toBeGreaterThanOrEqual(expected - 5000);
    expect(deadline.getTime()).toBeLessThanOrEqual(expected + 5000);
  });

  it("disables the submit button while the write is pending", async () => {
    let resolve!: () => void;
    vi.mocked(addDoc).mockReturnValueOnce(
      new Promise((res) => {
        resolve = () => res({} as never);
      }),
    );

    const user = userEvent.setup();
    await renderAndWaitForUsers();

    await user.type(screen.getByLabelText("Title"), "Steal the Stapler");
    await user.type(screen.getByLabelText("Description"), "Get the red one.");
    await user.selectOptions(screen.getByLabelText("Assign to"), "uid-a");

    const btn = screen.getByRole("button", { name: "Launch Heist" });
    await user.click(btn);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled(),
    );
    resolve();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/heists"));
  });

  it("redirects to /heists after a successful write", async () => {
    const user = userEvent.setup();
    await renderAndWaitForUsers();

    await user.type(screen.getByLabelText("Title"), "Steal the Stapler");
    await user.type(screen.getByLabelText("Description"), "Get the red one.");
    await user.selectOptions(screen.getByLabelText("Assign to"), "uid-a");
    await user.click(screen.getByRole("button", { name: "Launch Heist" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/heists"));
  });

  it("shows an inline error if addDoc rejects", async () => {
    vi.mocked(addDoc).mockRejectedValueOnce(new Error("permission-denied"));
    const user = userEvent.setup();
    await renderAndWaitForUsers();

    await user.type(screen.getByLabelText("Title"), "Steal the Stapler");
    await user.type(screen.getByLabelText("Description"), "Get the red one.");
    await user.selectOptions(screen.getByLabelText("Assign to"), "uid-a");
    await user.click(screen.getByRole("button", { name: "Launch Heist" }));

    await waitFor(() =>
      expect(
        screen.getByText("Something went wrong. Please try again."),
      ).toBeInTheDocument(),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
