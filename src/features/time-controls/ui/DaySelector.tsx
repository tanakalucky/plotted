import { MinusIcon, PlusIcon } from "lucide-react";
import type React from "react";

import { cn } from "@/shared/lib/utils";
import type { Action } from "@/shared/model";
import { Button } from "@/shared/ui/Button";

const MIN_DAYS = 1;
const MAX_DAYS = 7;

interface Props {
  days: number;
  activeDay: number;
  dispatch: React.Dispatch<Action>;
}

export const DaySelector = ({ days, activeDay, dispatch }: Props) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => dispatch({ type: "SET_DAYS", payload: { days: days - 1 } })}
        disabled={days <= MIN_DAYS}
        aria-label="Day数を減らす"
      >
        <MinusIcon className="size-3" />
      </Button>
      <div className="flex items-center gap-1 overflow-x-auto">
        {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            type="button"
            className={cn(
              "rounded-[var(--radius-button)] px-3 py-1 text-sm font-medium transition-colors",
              day === activeDay
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-ink-mid hover:bg-accent-pale",
            )}
            onClick={() => dispatch({ type: "SET_ACTIVE_DAY", payload: { day } })}
          >
            {`Day${day}`}
          </button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => dispatch({ type: "SET_DAYS", payload: { days: days + 1 } })}
        disabled={days >= MAX_DAYS}
        aria-label="Day数を増やす"
      >
        <PlusIcon className="size-3" />
      </Button>
    </div>
  );
};
