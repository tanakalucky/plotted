import { describe, it, expect } from "vitest";

import { clickToRatio, getRenderedImageBounds } from "./letterbox";

describe("getRenderedImageBounds", () => {
  it("landscape container + square image: horizontal letterbox (left/right)", () => {
    // Container: 1000x500, Image: 800x800
    // scale = min(1000/800, 500/800) = min(1.25, 0.625) = 0.625
    // renderedW = 800 * 0.625 = 500, renderedH = 800 * 0.625 = 500
    // left = (1000 - 500) / 2 = 250, top = (500 - 500) / 2 = 0
    const bounds = getRenderedImageBounds(1000, 500, 800, 800);
    expect(bounds.left).toBe(250);
    expect(bounds.top).toBe(0);
    expect(bounds.width).toBe(500);
    expect(bounds.height).toBe(500);
  });

  it("landscape container + wide image: vertical letterbox (top/bottom)", () => {
    // Container: 1000x500, Image: 1600x400
    // scale = min(1000/1600, 500/400) = min(0.625, 1.25) = 0.625
    // renderedW = 1600 * 0.625 = 1000, renderedH = 400 * 0.625 = 250
    // left = (1000 - 1000) / 2 = 0, top = (500 - 250) / 2 = 125
    const bounds = getRenderedImageBounds(1000, 500, 1600, 400);
    expect(bounds.left).toBe(0);
    expect(bounds.top).toBe(125);
    expect(bounds.width).toBe(1000);
    expect(bounds.height).toBe(250);
  });

  it("zero naturalWidth returns all zeros", () => {
    const bounds = getRenderedImageBounds(1000, 500, 0, 500);
    expect(bounds).toEqual({ left: 0, top: 0, width: 0, height: 0 });
  });

  it("zero naturalHeight returns all zeros", () => {
    const bounds = getRenderedImageBounds(1000, 500, 500, 0);
    expect(bounds).toEqual({ left: 0, top: 0, width: 0, height: 0 });
  });

  it("exact fit image (no letterbox)", () => {
    // Container: 800x600, Image: 800x600
    // scale = min(1, 1) = 1
    // renderedW = 800, renderedH = 600, left = 0, top = 0
    const bounds = getRenderedImageBounds(800, 600, 800, 600);
    expect(bounds.left).toBe(0);
    expect(bounds.top).toBe(0);
    expect(bounds.width).toBe(800);
    expect(bounds.height).toBe(600);
  });
});

describe("clickToRatio", () => {
  const bounds = { left: 250, top: 0, width: 500, height: 500 };

  it("click inside image area returns correct normalized coordinates", () => {
    // click at (300, 50) with bounds { left: 250, top: 0, width: 500, height: 500 }
    // x = (300 - 250) / 500 = 0.1
    // y = (50 - 0) / 500 = 0.1
    const result = clickToRatio(300, 50, bounds);
    expect(result).not.toBeNull();
    expect(result?.x).toBeCloseTo(0.1);
    expect(result?.y).toBeCloseTo(0.1);
  });

  it("click in left letterbox area returns null", () => {
    // click at (100, 50) - left of bounds.left=250
    const result = clickToRatio(100, 50, bounds);
    expect(result).toBeNull();
  });

  it("click in right letterbox area returns null", () => {
    // click at (900, 250) - right of bounds.left + bounds.width = 750
    const result = clickToRatio(900, 250, bounds);
    expect(result).toBeNull();
  });

  it("click at center of image returns (0.5, 0.5)", () => {
    // center: x = 250 + 500/2 = 500, y = 0 + 500/2 = 250
    const result = clickToRatio(500, 250, bounds);
    expect(result).not.toBeNull();
    expect(result?.x).toBeCloseTo(0.5);
    expect(result?.y).toBeCloseTo(0.5);
  });

  it("returns null when bounds have zero width", () => {
    const zeroBounds = { left: 0, top: 0, width: 0, height: 0 };
    const result = clickToRatio(0, 0, zeroBounds);
    expect(result).toBeNull();
  });
});
