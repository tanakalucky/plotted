export interface RenderedImageBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const getRenderedImageBounds = (
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number,
): RenderedImageBounds => {
  if (naturalW === 0 || naturalH === 0) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }
  const scale = Math.min(containerW / naturalW, containerH / naturalH);
  const renderedW = naturalW * scale;
  const renderedH = naturalH * scale;
  return {
    left: (containerW - renderedW) / 2,
    top: (containerH - renderedH) / 2,
    width: renderedW,
    height: renderedH,
  };
};

export const clickToRatio = (
  clickX: number,
  clickY: number,
  bounds: RenderedImageBounds,
): { x: number; y: number } | null => {
  if (bounds.width === 0 || bounds.height === 0) return null;
  if (
    clickX < bounds.left ||
    clickX > bounds.left + bounds.width ||
    clickY < bounds.top ||
    clickY > bounds.top + bounds.height
  ) {
    return null;
  }
  return {
    x: (clickX - bounds.left) / bounds.width,
    y: (clickY - bounds.top) / bounds.height,
  };
};
