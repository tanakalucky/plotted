import { PlusIcon } from "lucide-react";
import type React from "react";

import type { Action } from "@/shared/model";

interface Props {
  dispatch: React.Dispatch<Action>;
  existingNames: string[];
}

const getNextMapName = (existingNames: string[]): string => {
  let n = 1;
  while (existingNames.includes(`マップ${n}`)) {
    n++;
  }
  return `マップ${n}`;
};

export const AddMapButton = ({ dispatch, existingNames }: Props) => {
  const handleClick = () => {
    const id = crypto.randomUUID();
    const name = getNextMapName(existingNames);
    dispatch({ type: "ADD_MAP", payload: { id, name } });
  };

  return (
    <button
      type="button"
      className="flex size-full min-h-[calc(--spacing(64)+(--spacing(10)))] cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-border bg-muted/30 text-muted-foreground transition-all hover:brightness-95"
      onClick={handleClick}
      aria-label="マップを追加"
    >
      <PlusIcon className="size-8 opacity-50" />
    </button>
  );
};
