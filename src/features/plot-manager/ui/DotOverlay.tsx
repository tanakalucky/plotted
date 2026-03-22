import { useEffect, useRef, useState } from "react";
import type React from "react";

import type { Action } from "@/shared/model";
import type { CharDef, PlotLog } from "@/shared/model/state";

import { getRenderedImageBounds } from "../lib/letterbox";
import { PlotDot } from "./PlotDot";

interface Props {
  logs: PlotLog[];
  chars: CharDef[];
  mapId: string;
  activeDay: number;
  currentTime: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  imgRef: React.RefObject<HTMLImageElement | null>;
  dispatch: React.Dispatch<Action>;
}

export const DotOverlay = ({
  logs,
  chars,
  mapId,
  activeDay,
  currentTime,
  containerRef,
  imgRef,
  dispatch,
}: Props) => {
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  // Track image load state to trigger re-render when image loads
  const [imageLoaded, setImageLoaded] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new ResizeObserver(([entry]) => {
      setContainerSize({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    observerRef.current.observe(container);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [containerRef]);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (!imgEl) return;

    const handleLoad = () => setImageLoaded(true);

    if (imgEl.complete && imgEl.naturalWidth > 0) {
      setImageLoaded(true);
    } else {
      imgEl.addEventListener("load", handleLoad);
      return () => imgEl.removeEventListener("load", handleLoad);
    }
  }, [imgRef]);

  // Filter logs for the current map, day, and time
  const filteredLogs = logs.filter(
    (l) => l.map === mapId && l.day === activeDay && l.time === currentTime,
  );

  const imgEl = imgRef.current;
  const hasImage = imageLoaded && imgEl && imgEl.complete && imgEl.naturalWidth > 0;

  const bounds = hasImage
    ? getRenderedImageBounds(
        containerSize.w,
        containerSize.h,
        imgEl.naturalWidth,
        imgEl.naturalHeight,
      )
    : { left: 0, top: 0, width: 0, height: 0 };

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {hasImage &&
        filteredLogs.map((log) => {
          const char = chars.find((c) => c.name === log.char);
          if (!char) return null;

          const cx = bounds.left + log.x * bounds.width;
          const cy = bounds.top + log.y * bounds.height;

          return (
            <PlotDot
              key={log.id}
              cx={cx}
              cy={cy}
              color={char.color}
              initial={char.name[0]}
              onDelete={() => dispatch({ type: "DELETE_LOG", payload: { id: log.id } })}
            />
          );
        })}
    </svg>
  );
};
