import { useState } from "react";
import type React from "react";

import { cn } from "@/shared/lib/utils";
import type { Action } from "@/shared/model";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";

import { PRESET_COLORS } from "../lib/preset-colors";

interface Props {
  dispatch: React.Dispatch<Action>;
}

export const AddCharForm = ({ dispatch }: Props) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(PRESET_COLORS[0]);

  const handleAdd = () => {
    if (name.trim() === "") return;
    dispatch({ type: "ADD_CHAR", payload: { name: name.trim(), color } });
    setName("");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        maxLength={10}
        placeholder="キャラクター名"
        aria-label="キャラクター名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
        }}
        className="w-32"
      />
      <div className="flex items-center gap-1">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={cn(
              "size-6 cursor-pointer rounded-full border-2 transition-transform",
              c === color ? "scale-110 border-ink-dark" : "border-transparent",
            )}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
            aria-label={c}
          />
        ))}
      </div>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="size-8 cursor-pointer rounded border-border p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch-wrapper]:p-0"
        aria-label="カスタムカラー"
      />
      <Button size="sm" onClick={handleAdd} disabled={name.trim() === ""}>
        追加
      </Button>
    </div>
  );
};
