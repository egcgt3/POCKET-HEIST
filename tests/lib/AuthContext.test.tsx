import { act, renderHook } from "@testing-library/react";
import { onAuthStateChanged } from "firebase/auth";
import { AuthProvider, useUser } from "@/lib/AuthContext";

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
}));
vi.mock("@/lib/firebase", () => ({
  auth: {},
}));

describe("AuthContext", () => {
  let capturedCallback: (user: unknown) => void;
  const unsubscribeMock = vi.fn();

  beforeEach(() => {
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
      capturedCallback = callback as (user: unknown) => void;
      return unsubscribeMock;
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("returns { user: null, loading: true } before the listener fires", () => {
    const { result } = renderHook(() => useUser(), { wrapper: AuthProvider });
    expect(result.current).toEqual({ user: null, loading: true });
  });

  it("updates to { user, loading: false } when auth resolves with a user", () => {
    const { result } = renderHook(() => useUser(), { wrapper: AuthProvider });
    const fakeUser = { uid: "abc123", email: "test@example.com" };
    act(() => capturedCallback(fakeUser));
    expect(result.current).toEqual({ user: fakeUser, loading: false });
  });

  it("updates to { user: null, loading: false } when auth resolves with no user", () => {
    const { result } = renderHook(() => useUser(), { wrapper: AuthProvider });
    act(() => capturedCallback(null));
    expect(result.current).toEqual({ user: null, loading: false });
  });

  it("throws when called outside AuthProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useUser())).toThrow(
      "useUser must be used within an AuthProvider",
    );
  });
});
