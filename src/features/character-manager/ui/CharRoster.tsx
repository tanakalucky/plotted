import type React from "react";

import type { Action, CharDef } from "@/shared/model";

import { CharChip } from "./CharChip";

interface Props {
  chars: readonly CharDef[];
  activeChar: string | null;
  dispatch: React.Dispatch<Action>;
}

export const CharRoster = ({ chars, activeChar, dispatch }: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      {chars.map((char) => (
        <CharChip
          key={char.name}
          char={char}
          isActive={activeChar === char.name}
          onSelect={() => dispatch({ type: "SET_ACTIVE_CHAR", payload: { name: char.name } })}
          onDelete={() => dispatch({ type: "DELETE_CHAR", payload: { name: char.name } })}
        />
      ))}
    </div>
  );
};
