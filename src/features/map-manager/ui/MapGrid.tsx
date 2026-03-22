import type React from "react";

import type { Action, MapDef, State } from "@/shared/model";
import { MAX_MAPS } from "@/shared/model";

import { AddMapButton } from "./AddMapButton";
import { MapCard } from "./MapCard";

interface Props {
  maps: MapDef[];
  state: State;
  dispatch: React.Dispatch<Action>;
}

export const MapGrid = ({ maps, state, dispatch }: Props) => {
  const showAddButton = maps.length < MAX_MAPS;
  const isMultiColumn = maps.length >= 2 || (maps.length === 1 && showAddButton);

  const existingNames = maps.map((m) => m.name);

  return (
    <div className={`grid gap-4 ${isMultiColumn ? "grid-cols-2" : "grid-cols-1"}`}>
      {maps.map((mapDef) => (
        <MapCard key={mapDef.id} mapDef={mapDef} state={state} dispatch={dispatch} />
      ))}
      {showAddButton && <AddMapButton dispatch={dispatch} existingNames={existingNames} />}
    </div>
  );
};
