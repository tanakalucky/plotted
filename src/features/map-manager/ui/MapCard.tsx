import { useEffect, useRef, useState } from "react";
import type React from "react";

import { DotOverlay, clickToRatio, getRenderedImageBounds } from "@/features/plot-manager";
import type { Action, MapDef, State } from "@/shared/model";
import { loadMapImage, saveMapImage } from "@/shared/model";

import { MapHeader } from "./MapHeader";
import { MapPlaceholder } from "./MapPlaceholder";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface Props {
  mapDef: MapDef;
  state: State;
  dispatch: React.Dispatch<Action>;
}

export const MapCard = ({ mapDef, state, dispatch }: Props) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
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

  const addRipple = (x: number, y: number) => {
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!state.activeChar) return; // D-10: no active char, ignore
    const imgEl = imgRef.current;
    if (!imgEl || !imgEl.complete || imgEl.naturalWidth === 0) return;

    const containerRect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;

    const bounds = getRenderedImageBounds(
      containerRect.width,
      containerRect.height,
      imgEl.naturalWidth,
      imgEl.naturalHeight,
    );
    const ratio = clickToRatio(clickX, clickY, bounds);
    if (!ratio) return; // click in letterbox

    dispatch({
      type: "ADD_LOG",
      payload: {
        char: state.activeChar,
        map: mapDef.id,
        day: state.activeDay,
        time: state.currentTime,
        x: ratio.x,
        y: ratio.y,
      },
    });

    // Trigger ripple effect (D-11)
    addRipple(clickX, clickY);
  };

  const hasImage = mapDef.img !== null && objectUrl !== null;
  const cursor = hasImage ? (state.activeChar ? "crosshair" : "not-allowed") : "default";

  return (
    <div className="rounded-card border border-border bg-card">
      <MapHeader mapDef={mapDef} logsExist={logsExist} dispatch={dispatch} />

      <div
        ref={containerRef}
        className="relative h-64 overflow-hidden"
        style={{ cursor }}
        onClick={hasImage ? handleMapClick : undefined}
      >
        {hasImage ? (
          <>
            <img
              ref={imgRef}
              src={objectUrl}
              alt={mapDef.name}
              className="size-full object-contain"
            />
            <DotOverlay
              logs={state.logs}
              chars={state.chars}
              mapId={mapDef.id}
              activeDay={state.activeDay}
              currentTime={state.currentTime}
              containerRef={containerRef}
              imgRef={imgRef}
              dispatch={dispatch}
            />
            {ripples.map((ripple) => (
              <div
                key={ripple.id}
                style={{
                  position: "absolute",
                  left: ripple.x,
                  top: ripple.y,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "2px solid currentColor",
                  animation: "plotted-ripple 600ms ease-out forwards",
                  pointerEvents: "none",
                }}
              />
            ))}
          </>
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
