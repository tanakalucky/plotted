import { describe, it, expect } from "vitest";

import { TIME_MIN, TIME_MAX } from "@/shared/lib/time";

import { reducer } from "./reducer";
import { initialState } from "./state";
import type { State } from "./state";

const stateWithAlice: State = {
  ...initialState,
  chars: [{ name: "Alice", color: "#E63946" }],
};

const stateWithAliceAndLogs: State = {
  ...initialState,
  chars: [{ name: "Alice", color: "#E63946" }],
  logs: [
    { id: 1, char: "Alice", map: "map1", day: 1, time: 0, x: 0.5, y: 0.5 },
    { id: 2, char: "Alice", map: "map1", day: 2, time: 0, x: 0.3, y: 0.3 },
    { id: 3, char: "Bob", map: "map1", day: 1, time: 0, x: 0.1, y: 0.1 },
  ],
};

describe("ADD_CHAR", () => {
  it("キャラクターをchars配列に追加する", () => {
    const result = reducer(initialState, {
      type: "ADD_CHAR",
      payload: { name: "Alice", color: "#E63946" },
    });
    expect(result.chars).toEqual([{ name: "Alice", color: "#E63946" }]);
  });

  it("重複する名前のキャラクターは追加しない（stateを変更しない）", () => {
    const result = reducer(stateWithAlice, {
      type: "ADD_CHAR",
      payload: { name: "Alice", color: "#0000FF" },
    });
    expect(result).toBe(stateWithAlice);
  });

  it("名前をトリムして重複チェックする", () => {
    const result = reducer(stateWithAlice, {
      type: "ADD_CHAR",
      payload: { name: "  Alice  ", color: "#0000FF" },
    });
    expect(result).toBe(stateWithAlice);
  });
});

describe("DELETE_CHAR", () => {
  it("指定されたキャラクターをcharsから削除する", () => {
    const result = reducer(stateWithAlice, {
      type: "DELETE_CHAR",
      payload: { name: "Alice" },
    });
    expect(result.chars).toEqual([]);
  });

  it("キャラクターに関連するログをすべて削除する", () => {
    const result = reducer(stateWithAliceAndLogs, {
      type: "DELETE_CHAR",
      payload: { name: "Alice" },
    });
    expect(result.logs.every((log) => log.char !== "Alice")).toBe(true);
    expect(result.logs).toHaveLength(1);
  });

  it("削除したキャラクターがactiveCharの場合、nullにリセットする", () => {
    const state: State = { ...stateWithAlice, activeChar: "Alice" };
    const result = reducer(state, {
      type: "DELETE_CHAR",
      payload: { name: "Alice" },
    });
    expect(result.activeChar).toBeNull();
  });

  it("削除したキャラクターがactiveCharでない場合、activeCharは変わらない", () => {
    const state: State = {
      ...stateWithAliceAndLogs,
      chars: [
        { name: "Alice", color: "#E63946" },
        { name: "Bob", color: "#0000FF" },
      ],
      activeChar: "Alice",
    };
    const result = reducer(state, {
      type: "DELETE_CHAR",
      payload: { name: "Bob" },
    });
    expect(result.activeChar).toBe("Alice");
  });
});

describe("SET_ACTIVE_CHAR", () => {
  it("activeCharを指定された名前に設定する", () => {
    const result = reducer(stateWithAlice, {
      type: "SET_ACTIVE_CHAR",
      payload: { name: "Alice" },
    });
    expect(result.activeChar).toBe("Alice");
  });

  it("nullを渡すとactiveCharをnullにする（選択解除）", () => {
    const state: State = { ...stateWithAlice, activeChar: "Alice" };
    const result = reducer(state, {
      type: "SET_ACTIVE_CHAR",
      payload: { name: null },
    });
    expect(result.activeChar).toBeNull();
  });
});

describe("SET_DAYS", () => {
  it("daysを3に設定するとday > 3のログが削除される", () => {
    const state: State = {
      ...initialState,
      days: 5,
      logs: [
        { id: 1, char: "Alice", map: "map1", day: 2, time: 0, x: 0.5, y: 0.5 },
        { id: 2, char: "Alice", map: "map1", day: 3, time: 0, x: 0.3, y: 0.3 },
        { id: 3, char: "Alice", map: "map1", day: 4, time: 0, x: 0.1, y: 0.1 },
      ],
    };
    const result = reducer(state, {
      type: "SET_DAYS",
      payload: { days: 3 },
    });
    expect(result.logs).toHaveLength(2);
    expect(result.logs.every((log) => log.day <= 3)).toBe(true);
  });

  it("activeDayがnewDaysを超える場合、activeDayをnewDaysにクランプする", () => {
    const state: State = { ...initialState, days: 5, activeDay: 5 };
    const result = reducer(state, {
      type: "SET_DAYS",
      payload: { days: 3 },
    });
    expect(result.activeDay).toBe(3);
  });

  it("activeDayがnewDays以下の場合、activeDayは変わらない", () => {
    const state: State = { ...initialState, days: 5, activeDay: 3 };
    const result = reducer(state, {
      type: "SET_DAYS",
      payload: { days: 5 },
    });
    expect(result.activeDay).toBe(3);
  });

  it("daysを1-7の範囲にクランプする", () => {
    const result1 = reducer(initialState, {
      type: "SET_DAYS",
      payload: { days: 0 },
    });
    expect(result1.days).toBe(1);

    const result2 = reducer(initialState, {
      type: "SET_DAYS",
      payload: { days: 10 },
    });
    expect(result2.days).toBe(7);
  });
});

describe("SET_ACTIVE_DAY", () => {
  it("activeDayを指定されたday番号に設定する", () => {
    const result = reducer(initialState, {
      type: "SET_ACTIVE_DAY",
      payload: { day: 3 },
    });
    expect(result.activeDay).toBe(3);
  });
});

describe("SET_TIME", () => {
  it("currentTimeを指定された値に設定する", () => {
    const result = reducer(initialState, {
      type: "SET_TIME",
      payload: { time: 100 },
    });
    expect(result.currentTime).toBe(100);
  });

  it("負の値を指定するとTIME_MIN(0)にクランプされる", () => {
    const result = reducer(initialState, {
      type: "SET_TIME",
      payload: { time: -5 },
    });
    expect(result.currentTime).toBe(TIME_MIN);
  });

  it("TIME_MAXを超える値を指定するとTIME_MAX(287)にクランプされる", () => {
    const result = reducer(initialState, {
      type: "SET_TIME",
      payload: { time: 300 },
    });
    expect(result.currentTime).toBe(TIME_MAX);
  });
});

describe("ADJUST_TIME", () => {
  it("time=0でdelta=-1のとき0のまま（下限クランプ）", () => {
    const result = reducer(initialState, {
      type: "ADJUST_TIME",
      payload: { delta: -1 },
    });
    expect(result.currentTime).toBe(0);
  });

  it("time=287でdelta=+1のとき287のまま（上限クランプ）", () => {
    const state: State = { ...initialState, currentTime: TIME_MAX };
    const result = reducer(state, {
      type: "ADJUST_TIME",
      payload: { delta: 1 },
    });
    expect(result.currentTime).toBe(TIME_MAX);
  });

  it("time=140でdelta=+2のとき142になる", () => {
    const state: State = { ...initialState, currentTime: 140 };
    const result = reducer(state, {
      type: "ADJUST_TIME",
      payload: { delta: 2 },
    });
    expect(result.currentTime).toBe(142);
  });

  it("time=140でdelta=-1のとき139になる", () => {
    const state: State = { ...initialState, currentTime: 140 };
    const result = reducer(state, {
      type: "ADJUST_TIME",
      payload: { delta: -1 },
    });
    expect(result.currentTime).toBe(139);
  });
});

describe("RESET", () => {
  it("initialStateを返す（既存の動作を維持）", () => {
    const state: State = {
      ...initialState,
      chars: [{ name: "Alice", color: "#E63946" }],
      days: 3,
    };
    const result = reducer(state, { type: "RESET" });
    expect(result).toEqual(initialState);
  });
});

describe("ADD_MAP", () => {
  it("マップをmaps配列に追加する", () => {
    const result = reducer(initialState, {
      type: "ADD_MAP",
      payload: { id: "map-1", name: "マップ1" },
    });
    expect(result.maps).toEqual([{ id: "map-1", name: "マップ1", img: null }]);
  });

  it("4枚以上のマップは追加しない（stateを変更しない）", () => {
    const stateWith4Maps: State = {
      ...initialState,
      maps: [
        { id: "map-1", name: "マップ1", img: null },
        { id: "map-2", name: "マップ2", img: null },
        { id: "map-3", name: "マップ3", img: null },
        { id: "map-4", name: "マップ4", img: null },
      ],
    };
    const result = reducer(stateWith4Maps, {
      type: "ADD_MAP",
      payload: { id: "map-5", name: "マップ5" },
    });
    expect(result).toBe(stateWith4Maps);
  });
});

describe("DELETE_MAP", () => {
  it("指定されたIDのマップをmapsから削除する", () => {
    const stateWithMap: State = {
      ...initialState,
      maps: [{ id: "map-1", name: "マップ1", img: null }],
    };
    const result = reducer(stateWithMap, {
      type: "DELETE_MAP",
      payload: { id: "map-1" },
    });
    expect(result.maps).toEqual([]);
  });

  it("マップ削除時に関連するログをカスケード削除する", () => {
    const stateWithMapAndLogs: State = {
      ...initialState,
      maps: [
        { id: "map-1", name: "マップ1", img: null },
        { id: "map-2", name: "マップ2", img: null },
      ],
      logs: [
        { id: 1, char: "Alice", map: "map-1", day: 1, time: 0, x: 0.5, y: 0.5 },
        { id: 2, char: "Bob", map: "map-1", day: 1, time: 0, x: 0.3, y: 0.3 },
        { id: 3, char: "Alice", map: "map-2", day: 1, time: 0, x: 0.1, y: 0.1 },
      ],
    };
    const result = reducer(stateWithMapAndLogs, {
      type: "DELETE_MAP",
      payload: { id: "map-1" },
    });
    expect(result.maps).toHaveLength(1);
    expect(result.logs).toHaveLength(1);
    expect(result.logs[0].map).toBe("map-2");
  });

  it("存在しないIDを指定した場合、stateを変更しない", () => {
    const stateWithMap: State = {
      ...initialState,
      maps: [{ id: "map-1", name: "マップ1", img: null }],
    };
    const result = reducer(stateWithMap, {
      type: "DELETE_MAP",
      payload: { id: "map-999" },
    });
    expect(result.maps).toHaveLength(1);
  });
});

describe("RENAME_MAP", () => {
  it("指定されたIDのマップ名を更新する", () => {
    const stateWithMap: State = {
      ...initialState,
      maps: [{ id: "map-1", name: "マップ1", img: null }],
    };
    const result = reducer(stateWithMap, {
      type: "RENAME_MAP",
      payload: { id: "map-1", name: "新しいマップ名" },
    });
    expect(result.maps[0].name).toBe("新しいマップ名");
  });
});

describe("SET_MAP_IMAGE", () => {
  it("指定されたIDのマップのimgをpayload.idに設定する", () => {
    const stateWithMap: State = {
      ...initialState,
      maps: [{ id: "map-1", name: "マップ1", img: null }],
    };
    const result = reducer(stateWithMap, {
      type: "SET_MAP_IMAGE",
      payload: { id: "map-1" },
    });
    expect(result.maps[0].img).toBe("map-1");
  });
});

describe("ADD_LOG", () => {
  it("空のlogs配列にログを追加するとid=1が割り当てられる", () => {
    const result = reducer(initialState, {
      type: "ADD_LOG",
      payload: { char: "Alice", map: "map-1", day: 1, time: 0, x: 0.5, y: 0.5 },
    });
    expect(result.logs).toHaveLength(1);
    expect(result.logs[0].id).toBe(1);
    expect(result.logs[0].char).toBe("Alice");
    expect(result.logs[0].map).toBe("map-1");
    expect(result.logs[0].x).toBe(0.5);
    expect(result.logs[0].y).toBe(0.5);
  });

  it("既存のlogsがある場合、最大id+1が新しいidになる", () => {
    const stateWithLogs: State = {
      ...initialState,
      logs: [
        { id: 1, char: "Alice", map: "map-1", day: 1, time: 0, x: 0.5, y: 0.5 },
        { id: 3, char: "Bob", map: "map-1", day: 1, time: 0, x: 0.3, y: 0.3 },
      ],
    };
    const result = reducer(stateWithLogs, {
      type: "ADD_LOG",
      payload: { char: "Charlie", map: "map-1", day: 1, time: 10, x: 0.7, y: 0.7 },
    });
    expect(result.logs).toHaveLength(3);
    expect(result.logs[2].id).toBe(4); // max(1, 3) + 1 = 4
  });

  it("同じキャラクター・日時・マップに複数のログを追加できる", () => {
    const result1 = reducer(initialState, {
      type: "ADD_LOG",
      payload: { char: "Alice", map: "map-1", day: 1, time: 0, x: 0.5, y: 0.5 },
    });
    const result2 = reducer(result1, {
      type: "ADD_LOG",
      payload: { char: "Alice", map: "map-1", day: 1, time: 0, x: 0.3, y: 0.3 },
    });
    expect(result2.logs).toHaveLength(2);
    expect(result2.logs[1].id).toBe(2);
  });
});

describe("DELETE_LOG", () => {
  it("指定されたIDのログを削除する", () => {
    const stateWithLogs: State = {
      ...initialState,
      logs: [
        { id: 1, char: "Alice", map: "map-1", day: 1, time: 0, x: 0.5, y: 0.5 },
        { id: 2, char: "Bob", map: "map-1", day: 1, time: 0, x: 0.3, y: 0.3 },
      ],
    };
    const result = reducer(stateWithLogs, {
      type: "DELETE_LOG",
      payload: { id: 1 },
    });
    expect(result.logs).toHaveLength(1);
    expect(result.logs[0].id).toBe(2);
  });

  it("存在しないIDを指定してもstateは変わらない", () => {
    const stateWithLogs: State = {
      ...initialState,
      logs: [{ id: 1, char: "Alice", map: "map-1", day: 1, time: 0, x: 0.5, y: 0.5 }],
    };
    const result = reducer(stateWithLogs, {
      type: "DELETE_LOG",
      payload: { id: 999 },
    });
    expect(result.logs).toHaveLength(1);
  });
});
