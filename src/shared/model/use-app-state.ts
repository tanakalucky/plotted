import { useEffect, useReducer } from "react";

import { type Action, reducer } from "./reducer";
import { type State, initialState, isValidState } from "./state";

const STORAGE_KEY = "plotted-v1";

export const loadState = (): State => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return initialState;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValidState(parsed)) return initialState;
    return parsed;
  } catch {
    // D-04: silent reset on corrupted JSON
    return initialState;
  }
};

export const useAppState = (): { state: State; dispatch: React.Dispatch<Action> } => {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return { state, dispatch } as const;
};
