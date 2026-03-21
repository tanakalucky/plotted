import { match } from "ts-pattern";

import { TIME_MAX, TIME_MIN } from "@/shared/lib/time";

import { type State, initialState } from "./state";

export type Action =
  | { type: "RESET" }
  | { type: "ADD_CHAR"; payload: { name: string; color: string } }
  | { type: "DELETE_CHAR"; payload: { name: string } }
  | { type: "SET_ACTIVE_CHAR"; payload: { name: string | null } }
  | { type: "SET_DAYS"; payload: { days: number } }
  | { type: "SET_ACTIVE_DAY"; payload: { day: number } }
  | { type: "SET_TIME"; payload: { time: number } }
  | { type: "ADJUST_TIME"; payload: { delta: number } };

export const reducer = (state: State, action: Action): State =>
  match(action)
    .with({ type: "RESET" }, () => initialState)
    .with({ type: "ADD_CHAR" }, ({ payload }) => {
      const trimmedName = payload.name.trim();
      if (state.chars.some((c) => c.name === trimmedName)) return state;
      return {
        ...state,
        chars: [...state.chars, { name: trimmedName, color: payload.color }],
      };
    })
    .with({ type: "DELETE_CHAR" }, ({ payload }) => ({
      ...state,
      chars: state.chars.filter((c) => c.name !== payload.name),
      logs: state.logs.filter((log) => log.char !== payload.name),
      activeChar: state.activeChar === payload.name ? null : state.activeChar,
    }))
    .with({ type: "SET_ACTIVE_CHAR" }, ({ payload }) => ({
      ...state,
      activeChar: payload.name,
    }))
    .with({ type: "SET_DAYS" }, ({ payload }) => {
      const newDays = Math.max(1, Math.min(7, payload.days));
      return {
        ...state,
        days: newDays,
        logs: state.logs.filter((log) => log.day <= newDays),
        activeDay: Math.min(state.activeDay, newDays),
      };
    })
    .with({ type: "SET_ACTIVE_DAY" }, ({ payload }) => ({
      ...state,
      activeDay: payload.day,
    }))
    .with({ type: "SET_TIME" }, ({ payload }) => ({
      ...state,
      currentTime: Math.max(TIME_MIN, Math.min(TIME_MAX, payload.time)),
    }))
    .with({ type: "ADJUST_TIME" }, ({ payload }) => ({
      ...state,
      currentTime: Math.max(TIME_MIN, Math.min(TIME_MAX, state.currentTime + payload.delta)),
    }))
    .exhaustive();
