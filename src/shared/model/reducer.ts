import { match } from "ts-pattern";

import { TIME_MAX, TIME_MIN } from "@/shared/lib/time";

import { type PlotLog, type State, initialState } from "./state";

export const MAX_MAPS = 4;

export type Action =
  | { type: "RESET" }
  | { type: "ADD_CHAR"; payload: { name: string; color: string } }
  | { type: "DELETE_CHAR"; payload: { name: string } }
  | { type: "SET_ACTIVE_CHAR"; payload: { name: string | null } }
  | { type: "SET_DAYS"; payload: { days: number } }
  | { type: "SET_ACTIVE_DAY"; payload: { day: number } }
  | { type: "SET_TIME"; payload: { time: number } }
  | { type: "ADJUST_TIME"; payload: { delta: number } }
  | { type: "ADD_MAP"; payload: { id: string; name: string } }
  | { type: "DELETE_MAP"; payload: { id: string } }
  | { type: "RENAME_MAP"; payload: { id: string; name: string } }
  | { type: "SET_MAP_IMAGE"; payload: { id: string } }
  | { type: "ADD_LOG"; payload: Omit<PlotLog, "id"> }
  | { type: "DELETE_LOG"; payload: { id: number } };

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
    .with({ type: "ADD_MAP" }, ({ payload }) => {
      if (state.maps.length >= MAX_MAPS) return state;
      return {
        ...state,
        maps: [...state.maps, { id: payload.id, name: payload.name, img: null }],
      };
    })
    .with({ type: "DELETE_MAP" }, ({ payload }) => ({
      ...state,
      maps: state.maps.filter((m) => m.id !== payload.id),
      logs: state.logs.filter((log) => log.map !== payload.id),
    }))
    .with({ type: "RENAME_MAP" }, ({ payload }) => ({
      ...state,
      maps: state.maps.map((m) => (m.id === payload.id ? { ...m, name: payload.name } : m)),
    }))
    .with({ type: "SET_MAP_IMAGE" }, ({ payload }) => ({
      ...state,
      maps: state.maps.map((m) => (m.id === payload.id ? { ...m, img: payload.id } : m)),
    }))
    .with({ type: "ADD_LOG" }, ({ payload }) => {
      const newId = state.logs.length > 0 ? Math.max(...state.logs.map((l) => l.id)) + 1 : 1;
      return { ...state, logs: [...state.logs, { ...payload, id: newId }] };
    })
    .with({ type: "DELETE_LOG" }, ({ payload }) => ({
      ...state,
      logs: state.logs.filter((l) => l.id !== payload.id),
    }))
    .exhaustive();
