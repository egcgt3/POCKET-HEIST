import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { onSnapshot, where } from "firebase/firestore";
import { useHeists } from "@/hooks/useHeists";
import { useUser } from "@/lib/AuthContext";
import type { Heist } from "@/types/firestore";

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({ withConverter: vi.fn(() => ({})) })),
  onSnapshot: vi.fn(),
  query: vi.fn(() => ({})),
  where: vi.fn((field, op, value) => ({ field, op, value })),
}));
vi.mock("@/lib/firebase", () => ({ db: {} }));
vi.mock("@/lib/AuthContext", () => ({ useUser: vi.fn() }));

const fakeUser = { uid: "user-uid" };

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "h1",
    title: "Steal the Stapler",
    description: "Get the red one.",
    createdBy: "user-uid",
    createdByCodename: "SilentOnyxRaven",
    assignedTo: "user-uid",
    assignedToCodename: "SilentOnyxRaven",
    deadline: new Date(),
    finalStatus: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeSnapshot(docs: Heist[]) {
  return { docs: docs.map((data) => ({ data: () => data })) };
}

let capturedOnNext: ((snap: unknown) => void) | undefined;
let capturedOnError: ((err: unknown) => void) | undefined;
const unsubMock = vi.fn();

beforeEach(() => {
  vi.mocked(useUser).mockReturnValue({
    user: fakeUser as never,
    loading: false,
  });
  vi.mocked(onSnapshot).mockImplementation((_q, onNext, onError) => {
    capturedOnNext = onNext as typeof capturedOnNext;
    capturedOnError = onError as typeof capturedOnError;
    return unsubMock;
  });
});

afterEach(() => vi.clearAllMocks());

describe("useHeists", () => {
  it("returns { heists: [], loading: true } while user is loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true });
    const { result } = renderHook(() => useHeists("active"));
    expect(result.current).toEqual({ heists: [], loading: true });
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it("returns { heists: [], loading: true } when user is null", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false });
    const { result } = renderHook(() => useHeists("active"));
    expect(result.current).toEqual({ heists: [], loading: true });
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it("subscribes with correct where clauses for 'active' mode", () => {
    renderHook(() => useHeists("active"));
    expect(where).toHaveBeenCalledWith("assignedTo", "==", fakeUser.uid);
    expect(where).toHaveBeenCalledWith("deadline", ">", expect.any(Date));
    expect(where).not.toHaveBeenCalledWith(
      "createdBy",
      expect.any(String),
      expect.anything(),
    );
  });

  it("subscribes with correct where clauses for 'assigned' mode", () => {
    renderHook(() => useHeists("assigned"));
    expect(where).toHaveBeenCalledWith("createdBy", "==", fakeUser.uid);
    expect(where).toHaveBeenCalledWith("deadline", ">", expect.any(Date));
    expect(where).not.toHaveBeenCalledWith(
      "assignedTo",
      expect.any(String),
      expect.anything(),
    );
  });

  it("subscribes with correct where clauses for 'expired' mode", () => {
    renderHook(() => useHeists("expired"));
    expect(where).toHaveBeenCalledWith("assignedTo", "==", fakeUser.uid);
    expect(where).toHaveBeenCalledWith("deadline", "<=", expect.any(Date));
  });

  it("returns heists from the snapshot", () => {
    const heist = makeHeist({ finalStatus: "success" });
    const { result } = renderHook(() => useHeists("active"));
    act(() => capturedOnNext!(makeSnapshot([heist])));
    expect(result.current.heists).toEqual([heist]);
    expect(result.current.loading).toBe(false);
  });

  it("calls unsubscribe on unmount", () => {
    const { unmount } = renderHook(() => useHeists("active"));
    unmount();
    expect(unsubMock).toHaveBeenCalled();
  });

  it("returns { heists: [], loading: false } without throwing on listener error", () => {
    const { result } = renderHook(() => useHeists("active"));
    act(() => capturedOnError!(new Error("permission-denied")));
    expect(result.current).toEqual({ heists: [], loading: false });
  });

  it("filters out heists with finalStatus: null for 'expired' mode", () => {
    const withStatus = makeHeist({ finalStatus: "success" });
    const withNull = makeHeist({ id: "h2", finalStatus: null });
    const { result } = renderHook(() => useHeists("expired"));
    act(() => capturedOnNext!(makeSnapshot([withStatus, withNull])));
    expect(result.current.heists).toHaveLength(1);
    expect(result.current.heists[0].finalStatus).toBe("success");
  });
});
