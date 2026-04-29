import { useCallback, useMemo, useRef, useState } from "react";

function brushRgbToCss({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

export function useDrawTool({ canvasBaseColor }) {
  const canvasBaseColorRef = useRef(canvasBaseColor);
  canvasBaseColorRef.current = canvasBaseColor;

  const [drawMode, setDrawMode] = useState("draw");
  const [brushRgb, setBrushRgb] = useState({ r: 0, g: 0, b: 0 });

  const isDrawMode = drawMode === "draw";
  const isEraseMode = drawMode === "erase";

  const selectDrawBrush = useCallback(() => {
    setDrawMode("draw");
  }, []);

  const toggleErase = useCallback(() => {
    setDrawMode((mode) => (mode === "erase" ? "draw" : "erase"));
  }, []);

  const getPaintColor = useMemo(() => {
    if (isEraseMode) {
      return () => canvasBaseColorRef.current;
    }
    return () => brushRgbToCss(brushRgb);
  }, [isEraseMode, brushRgb]);

  return {
    brushRgb,
    setBrushRgb,
    drawMode,
    isDrawMode,
    isEraseMode,
    selectDrawBrush,
    toggleErase,
    getPaintColor,
  };
}
