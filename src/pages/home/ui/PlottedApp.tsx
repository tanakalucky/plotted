import { Collapsible } from "@base-ui/react/collapsible";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";

import { AddCharForm, CharRoster } from "@/features/character-manager";
import { DaySelector, FineAdjustButtons, TimeSlider } from "@/features/time-controls";
import { useAppState } from "@/shared/model";
import { Button } from "@/shared/ui/Button";

export const PlottedApp = () => {
  const { state, dispatch } = useAppState();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="border-b border-border-gold bg-card p-3">
        <div className="flex items-start gap-2">
          <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} className="min-w-0 flex-1">
            <Collapsible.Trigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={isOpen ? "コントロールを折りたたむ" : "コントロールを展開する"}
                >
                  {isOpen ? (
                    <ChevronUpIcon className="size-4" />
                  ) : (
                    <ChevronDownIcon className="size-4" />
                  )}
                </Button>
              }
            />
            <Collapsible.Panel>
              <div className="mt-3 flex gap-6">
                {/* Character section */}
                <div className="shrink-0">
                  <CharRoster
                    chars={state.chars}
                    activeChar={state.activeChar}
                    dispatch={dispatch}
                  />
                  <div className="mt-2">
                    <AddCharForm dispatch={dispatch} />
                  </div>
                </div>
                {/* Time section */}
                <div className="min-w-0 flex-1 space-y-2">
                  <DaySelector days={state.days} activeDay={state.activeDay} dispatch={dispatch} />
                  <TimeSlider currentTime={state.currentTime} dispatch={dispatch} />
                  <FineAdjustButtons dispatch={dispatch} />
                </div>
              </div>
            </Collapsible.Panel>
          </Collapsible.Root>

          {/* Reset button */}
          <div className="ml-auto">
            <Dialog.Root>
              <Dialog.Trigger
                render={
                  <Button variant="ghost" size="xs" className="text-muted-foreground">
                    リセット
                  </Button>
                }
              />
              <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 bg-black/40" />
                <Dialog.Popup className="fixed top-1/2 left-1/2 w-80 -translate-1/2 rounded-card border border-border bg-card p-6 shadow-lg">
                  <Dialog.Title className="text-base font-semibold text-foreground">
                    データをリセット
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                    全キャラクター・ログ・マップデータが削除されます。この操作は取り消せません。
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
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => dispatch({ type: "RESET" })}
                        >
                          リセット
                        </Button>
                      }
                    />
                  </div>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </div>

      {/* Map area — Phase 3 */}
      <div className="p-4" />
    </div>
  );
};
