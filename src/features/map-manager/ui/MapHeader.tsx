import { Dialog } from "@base-ui/react/dialog";
import { Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import type React from "react";

import type { Action } from "@/shared/model";
import { deleteMapImage } from "@/shared/model";
import type { MapDef } from "@/shared/model";
import { Button } from "@/shared/ui/Button";

interface Props {
  mapDef: MapDef;
  logsExist: boolean;
  dispatch: React.Dispatch<Action>;
}

export const MapHeader = ({ mapDef, logsExist, dispatch }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(mapDef.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const confirmRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== mapDef.name) {
      dispatch({ type: "RENAME_MAP", payload: { id: mapDef.id, name: trimmed } });
    } else {
      setDraft(mapDef.name);
    }
    setIsEditing(false);
  };

  const handleDeleteConfirm = () => {
    dispatch({ type: "DELETE_MAP", payload: { id: mapDef.id } });
    void deleteMapImage(mapDef.id);
  };

  return (
    <div className="flex items-center border-b border-border px-3 py-2">
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            className="w-full bg-transparent text-sm text-foreground outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={confirmRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmRename();
              if (e.key === "Escape") {
                setDraft(mapDef.name);
                setIsEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className="cursor-text truncate text-sm text-foreground"
            onDoubleClick={() => {
              setDraft(mapDef.name);
              setIsEditing(true);
            }}
          >
            {mapDef.name}
          </span>
        )}
      </div>

      {logsExist ? (
        <Dialog.Root>
          <Dialog.Trigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="マップを削除"
                className="ml-2 shrink-0"
              >
                <Trash2Icon className="size-3" />
              </Button>
            }
          />
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-black/40" />
            <Dialog.Popup className="fixed top-1/2 left-1/2 w-80 -translate-1/2 rounded-card border border-border bg-card p-6 shadow-lg">
              <Dialog.Title className="text-base font-semibold text-foreground">
                マップを削除
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                このマップと関連するプロットデータが削除されます。この操作は取り消せません。
              </Dialog.Description>
              <div className="mt-4 flex justify-end gap-2">
                <Dialog.Close
                  render={
                    <Button variant="outline" size="sm">
                      キャンセル
                    </Button>
                  }
                />
                <Dialog.Close
                  render={
                    <Button variant="destructive" size="sm" onClick={handleDeleteConfirm}>
                      削除
                    </Button>
                  }
                />
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      ) : (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="マップを削除"
          className="ml-2 shrink-0"
          onClick={handleDeleteConfirm}
        >
          <Trash2Icon className="size-3" />
        </Button>
      )}
    </div>
  );
};
