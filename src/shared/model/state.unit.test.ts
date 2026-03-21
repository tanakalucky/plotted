import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { reducer } from "./reducer";
import { initialState, isValidState } from "./state";
import { loadState } from "./use-app-state";

describe("isValidState", () => {
  it("returns true for a valid state object with all 7 keys", () => {
    const valid = {
      chars: [],
      maps: [],
      logs: [],
      days: 1,
      activeChar: null,
      activeDay: 1,
      currentTime: 0,
    };
    expect(isValidState(valid)).toBe(true);
  });

  it("returns false when a key is missing", () => {
    const missing = {
      chars: [],
      maps: [],
      logs: [],
      days: 1,
      activeChar: null,
      activeDay: 1,
      // currentTime is missing
    };
    expect(isValidState(missing)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isValidState(null)).toBe(false);
  });

  it("returns false for non-object (string)", () => {
    expect(isValidState("not an object")).toBe(false);
  });

  it("returns false for non-object (number)", () => {
    expect(isValidState(42)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isValidState(undefined)).toBe(false);
  });

  it("returns true for initialState", () => {
    expect(isValidState(initialState)).toBe(true);
  });
});

describe("reducer", () => {
  it("handles RESET action by returning initialState", () => {
    const stateWithData = {
      ...initialState,
      chars: [{ name: "Alice", color: "#ff0000" }],
      days: 3,
    };
    const result = reducer(stateWithData, { type: "RESET" });
    expect(result).toEqual(initialState);
  });

  it("returns current state for unknown action", () => {
    const state = { ...initialState, days: 5 };
    // @ts-expect-error testing unknown action
    const result = reducer(state, { type: "UNKNOWN" });
    expect(result).toBe(state);
  });
});

describe("loadState", () => {
  const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    vi.stubGlobal("localStorage", mockLocalStorage);
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns initialState when localStorage is empty", () => {
    const result = loadState();
    expect(result).toEqual(initialState);
  });

  it("returns parsed state when valid JSON is stored", () => {
    const stored = { ...initialState, days: 5 };
    mockLocalStorage.setItem("plotted-v1", JSON.stringify(stored));
    const result = loadState();
    expect(result).toEqual(stored);
  });

  it("returns initialState when JSON is malformed (D-04)", () => {
    mockLocalStorage.setItem("plotted-v1", "{ invalid json {{");
    const result = loadState();
    expect(result).toEqual(initialState);
  });

  it("returns initialState when JSON has missing keys (D-05)", () => {
    const incomplete = { chars: [], maps: [], logs: [] };
    mockLocalStorage.setItem("plotted-v1", JSON.stringify(incomplete));
    const result = loadState();
    expect(result).toEqual(initialState);
  });
});
