import { useCallback, useEffect, useRef, useState } from "react";
import { createCanvasInputController } from "../lib/canvasInputController";
import { createCanvasRenderer } from "../lib/canvasRenderer";
import { cloneGrid, createGrid, setPixel } from "../lib/gridModel";

export function usePixelCanvas({
  getPaintColor,
  canvasBaseColor,
  maxCanvasSize,
  initialSize = 16,
}) {
  const [size, setSize] = useState(initialSize);
  const [grid, setGrid] = useState(() =>
    createGrid(initialSize, canvasBaseColor),
  );

  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const applyPaintRef = useRef(() => {});
  const sizeRef = useRef(size);
  const gridRef = useRef(grid);
  const getPaintColorRef = useRef(getPaintColor);

  getPaintColorRef.current = getPaintColor;

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.imageSmoothingEnabled = false;
    rendererRef.current = createCanvasRenderer({
      canvas,
      ctx,
      maxCanvasSize,
    });
    rendererRef.current.resizeForGrid(sizeRef.current);
    rendererRef.current.redraw(gridRef.current);

    const inputController = createCanvasInputController({
      getGridSize: () => sizeRef.current,
      onInput(payload) {
        if (!payload.isDragging) {
          return;
        }
        applyPaintRef.current(payload.x, payload.y);
      },
    });
    inputController.attach(canvas);
    return () => {
      inputController.detach();
    };
  }, [maxCanvasSize]);

  function applyPaint(x, y) {
    const color = getPaintColorRef.current();
    const nextGrid = cloneGrid(gridRef.current);
    const changed = setPixel(nextGrid, x, y, color);
    if (!changed) {
      return;
    }

    gridRef.current = nextGrid;
    setGrid(nextGrid);
    rendererRef.current?.drawPixel(x, y, color, sizeRef.current);
  }

  applyPaintRef.current = applyPaint;

  const clear = useCallback(() => {
    const clearedGrid = createGrid(sizeRef.current, canvasBaseColor);
    gridRef.current = clearedGrid;
    setGrid(clearedGrid);
    rendererRef.current?.redraw(clearedGrid);
  }, [canvasBaseColor]);

  const resizeGrid = useCallback(
    (newSize) => {
      setSize(newSize);
      sizeRef.current = newSize;
      rendererRef.current?.resizeForGrid(newSize);
      const freshGrid = createGrid(newSize, canvasBaseColor);
      gridRef.current = freshGrid;
      setGrid(freshGrid);
      rendererRef.current?.redraw(freshGrid);
    },
    [canvasBaseColor],
  );

  const applyFrame = useCallback((frame) => {
    if (frame.length !== sizeRef.current) {
      const nextSize = frame.length;
      sizeRef.current = nextSize;
      setSize(nextSize);
      rendererRef.current?.resizeForGrid(nextSize);
    }
    const nextGrid = cloneGrid(frame);
    gridRef.current = nextGrid;
    setGrid(nextGrid);
    rendererRef.current?.redraw(nextGrid);
  }, []);

  const resetToBlankCanvas = useCallback(() => {
    const next = createGrid(sizeRef.current, canvasBaseColor);
    gridRef.current = next;
    setGrid(next);
    rendererRef.current?.redraw(next);
  }, [canvasBaseColor]);

  const getGrid = useCallback(() => gridRef.current, []);

  return {
    canvasRef,
    size,
    grid,
    clear,
    resizeGrid,
    applyFrame,
    resetToBlankCanvas,
    getGrid,
  };
}
