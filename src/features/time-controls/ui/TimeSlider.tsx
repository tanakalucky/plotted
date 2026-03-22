import { Slider } from "@base-ui/react/slider";
import type React from "react";

import { SLIDER_TICKS, TIME_MAX, timeIndexToLabel } from "@/shared/lib/time";
import type { Action } from "@/shared/model";

interface Props {
  currentTime: number;
  dispatch: React.Dispatch<Action>;
}

export const TimeSlider = ({ currentTime, dispatch }: Props) => {
  return (
    <div className="w-full space-y-0">
      <div className="flex w-full items-center gap-3">
        <span className="min-w-[4ch] font-serif text-lg tracking-wider text-ink-dark tabular-nums">
          {timeIndexToLabel(currentTime)}
        </span>
        <div className="flex-1">
          <Slider.Root
            value={currentTime}
            onValueChange={(v) => dispatch({ type: "SET_TIME", payload: { time: v } })}
            min={0}
            max={TIME_MAX}
            step={1}
            aria-label="時刻"
          >
            <Slider.Control className="flex h-4 w-full touch-none items-center">
              <Slider.Track className="relative h-1 w-full rounded-full bg-border-light">
                <Slider.Indicator className="rounded-full bg-primary" />
                <Slider.Thumb className="size-4 rounded-full border-2 border-primary bg-card shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>
          <div className="relative mt-1 h-4 w-full">
            {SLIDER_TICKS.map((tick) => (
              <span
                key={tick}
                className="absolute -translate-x-1/2 text-xs text-ink-muted"
                style={{ left: `${(tick / TIME_MAX) * 100}%` }}
              >
                {Math.floor((tick * 5) / 60)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
