export const TIME_MIN = 0;
export const TIME_MAX = 287;
export const MINUTES_PER_STEP = 5;
// Hourly tick indices: 0h=0, 1h=12, 2h=24, ... 23h=276
export const SLIDER_TICKS = Array.from({ length: 24 }, (_, i) => i * 12);

export const timeIndexToLabel = (index: number): string => {
  const totalMinutes = index * MINUTES_PER_STEP;
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};
