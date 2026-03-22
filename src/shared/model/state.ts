export interface PlotLog {
  id: number;
  char: string;
  map: string;
  day: number;
  time: number; // 0-287 (5-minute index)
  x: number; // 0.0-1.0
  y: number; // 0.0-1.0
}

export interface MapDef {
  id: string;
  name: string;
  img: string | null; // map ID key into IndexedDB
}

export interface CharDef {
  name: string;
  color: string;
}

export interface State {
  chars: CharDef[];
  maps: MapDef[];
  logs: PlotLog[];
  days: number; // 1-7
  activeChar: string | null;
  activeDay: number;
  currentTime: number; // 0-287
}

export const initialState: State = {
  chars: [],
  maps: [],
  logs: [],
  days: 1,
  activeChar: null,
  activeDay: 1,
  currentTime: 0,
};

export const isValidState = (v: unknown): v is State => {
  if (typeof v !== "object" || v === null) return false;
  const keys = ["chars", "maps", "logs", "days", "activeChar", "activeDay", "currentTime"];
  return keys.every((key) => key in v);
};
