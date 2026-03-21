import { describe, it, expect } from "vitest";

import { timeIndexToLabel, TIME_MIN, TIME_MAX, MINUTES_PER_STEP, SLIDER_TICKS } from "./time";

describe("timeIndexToLabel", () => {
  it("インデックス0は'00:00'を返す", () => {
    expect(timeIndexToLabel(0)).toBe("00:00");
  });

  it("インデックス1は'00:05'を返す", () => {
    expect(timeIndexToLabel(1)).toBe("00:05");
  });

  it("インデックス2は'00:10'を返す", () => {
    expect(timeIndexToLabel(2)).toBe("00:10");
  });

  it("インデックス12は'01:00'を返す", () => {
    expect(timeIndexToLabel(12)).toBe("01:00");
  });

  it("インデックス72は'06:00'を返す", () => {
    expect(timeIndexToLabel(72)).toBe("06:00");
  });

  it("インデックス144は'12:00'を返す", () => {
    expect(timeIndexToLabel(144)).toBe("12:00");
  });

  it("インデックス216は'18:00'を返す", () => {
    expect(timeIndexToLabel(216)).toBe("18:00");
  });

  it("インデックス287は'23:55'を返す", () => {
    expect(timeIndexToLabel(287)).toBe("23:55");
  });
});

describe("TIME_MIN", () => {
  it("TIME_MINは0である", () => {
    expect(TIME_MIN).toBe(0);
  });
});

describe("TIME_MAX", () => {
  it("TIME_MAXは287である", () => {
    expect(TIME_MAX).toBe(287);
  });
});

describe("MINUTES_PER_STEP", () => {
  it("MINUTES_PER_STEPは5である", () => {
    expect(MINUTES_PER_STEP).toBe(5);
  });
});

describe("SLIDER_TICKS", () => {
  it("SLIDER_TICKSは[0, 72, 144, 216, 287]である", () => {
    expect(SLIDER_TICKS).toEqual([0, 72, 144, 216, 287]);
  });
});
