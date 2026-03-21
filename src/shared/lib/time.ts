export const TIME_MIN = 0;
export const TIME_MAX = 287;
export const MINUTES_PER_STEP = 5;
export const SLIDER_TICKS = [0, 72, 144, 216, 287] as const;

export const timeIndexToLabel = (index: number): string => {
  const totalMinutes = index * MINUTES_PER_STEP;
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};
