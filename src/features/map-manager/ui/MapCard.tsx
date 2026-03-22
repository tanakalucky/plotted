import { useEffect, useRef, useState } from "react";
import type React from "react";

import type { Action, MapDef, State } from "@/shared/model";
import { loadMapImage, saveMapImage } from "@/shared/model";

import { MapHeader } from "./MapHeader";
import { MapPlaceholder } from "./MapPlaceholder";

interface Props {
  mapDef: MapDef;
  state: State;
  dispatch: React.Dispatch<Action>;
}

export const MapCard = ({ mapDef, state, dispatch }: Props) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsExist = state.logs.some((log) => log.map === mapDef.id);

  useEffect(() => {
    if (!mapDef.img) {
      setObjectUrl(null);
      return;
    }

    let url: string | null = null;
    loadMapImage(mapDef.id).then((blob) => {
      if (blob) {
        url = URL.createObjectURL(blob);
        setObjectUrl(url);
      }
    });

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [mapDef.id, mapDef.img]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    await saveMapImage(mapDef.id, blob);
    dispatch({ type: "SET_MAP_IMAGE", payload: { id: mapDef.id } });

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="rounded-card border border-border bg-card">
      <MapHeader mapDef={mapDef} logsExist={logsExist} dispatch={dispatch} />

      <div className="relative h-64">
        {mapDef.img && objectUrl ? (
          <img src={objectUrl} alt={mapDef.name} className="size-full  object-contain" />
        ) : (
          <MapPlaceholder onUploadClick={handleUploadClick} />
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label="マップ画像を選択"
      />
    </div>
  );
};
