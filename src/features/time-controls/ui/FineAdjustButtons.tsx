import type React from "react";

import type { Action } from "@/shared/model";
import { Button } from "@/shared/ui/Button";

interface Props {
  dispatch: React.Dispatch<Action>;
}

export const FineAdjustButtons = ({ dispatch }: Props) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="xs"
        onClick={() => dispatch({ type: "ADJUST_TIME", payload: { delta: -2 } })}
      >
        -10m
      </Button>
      <Button
        variant="outline"
        size="xs"
        onClick={() => dispatch({ type: "ADJUST_TIME", payload: { delta: -1 } })}
      >
        -5m
      </Button>
      <Button
        variant="outline"
        size="xs"
        onClick={() => dispatch({ type: "ADJUST_TIME", payload: { delta: 1 } })}
      >
        +5m
      </Button>
      <Button
        variant="outline"
        size="xs"
        onClick={() => dispatch({ type: "ADJUST_TIME", payload: { delta: 2 } })}
      >
        +10m
      </Button>
    </div>
  );
};
