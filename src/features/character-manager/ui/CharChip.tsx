import { XIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import type { CharDef } from "@/shared/model";

interface Props {
  char: CharDef;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const CharChip = ({ char, isActive, onSelect, onDelete }: Props) => {
  return (
    <div
      role="button"
      aria-pressed={isActive}
      tabIndex={0}
      className={cn(
        "group relative inline-flex cursor-pointer items-center rounded-[var(--radius-chip)] px-3 py-1 text-sm font-medium text-white transition-all select-none",
        isActive && "scale-110 shadow-md",
      )}
      style={{ backgroundColor: char.color }}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <span>{char.name}</span>
      <button
        type="button"
        className="ml-1 hidden items-center rounded-full p-0.5 group-hover:inline-flex hover:bg-black/20"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`${char.name}を削除`}
      >
        <XIcon className="size-3" />
      </button>
    </div>
  );
};
