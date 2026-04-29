import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BrushColorControls from "./components/BrushColorControls";
import DrawToolControls from "./components/DrawToolControls";
import FrameTimeline from "./components/FrameTimeline";
import { createAnimationController } from "./lib/animationController";
import { createCanvasInputController } from "./lib/canvasInputController";
import { createCanvasRenderer } from "./lib/canvasRenderer";
import { cloneGrid, createGrid, setPixel } from "./lib/gridModel";

const CANVAS_BASE_COLOR = "#ffffff";
const MAX_CANVAS_SIZE = 512;

function brushRgbToCss({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

export default function App() {
  const [size, setSize] = useState(16);
  const [grid, setGrid] = useState(() => createGrid(16, CANVAS_BASE_COLOR));
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [frames, setFrames] = useState([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(null);
  const [drawMode, setDrawMode] = useState("draw");
  const [brushRgb, setBrushRgb] = useState({ r: 0, g: 0, b: 0 });

  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const animationControllerRef = useRef(null);
  const applyPaintRef = useRef(() => {});
  const sizeRef = useRef(size);
  const gridRef = useRef(grid);

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
      maxCanvasSize: MAX_CANVAS_SIZE,
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
  }, []);

  useEffect(() => {
    if (!rendererRef.current) {
      return;
    }
    animationControllerRef.current = createAnimationController({
      onApplyFrame(frame) {
        if (frame.length !== sizeRef.current) {
          sizeRef.current = frame.length;
          setSize(frame.length);
          rendererRef.current.resizeForGrid(frame.length);
        }
        const nextGrid = cloneGrid(frame);
        gridRef.current = nextGrid;
        setGrid(nextGrid);
        rendererRef.current.redraw(nextGrid);
      },
      onPlayingChange(nextIsPlaying) {
        setIsPlaying(nextIsPlaying);
      },
      onFrameCountChange(nextFrameCount) {
        setFrameCount(nextFrameCount);
        setFrames(animationControllerRef.current?.getFrames() ?? []);
      },
    });

    animationControllerRef.current.reset();
    return () => {
      animationControllerRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (frames.length === 0) {
      setSelectedFrameIndex(null);
      return;
    }
    setSelectedFrameIndex((prev) =>
      prev !== null && prev >= frames.length ? null : prev,
    );
  }, [frames.length]);

  const isDrawMode = drawMode === "draw";
  const isEraseMode = drawMode === "erase";

  const resolvePaintColor = useMemo(() => {
    if (drawMode === "erase") {
      return () => CANVAS_BASE_COLOR;
    }
    return () => brushRgbToCss(brushRgb);
  }, [drawMode, brushRgb]);

  function applyPaint(x, y) {
    const color = resolvePaintColor();
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

  function handleClear() {
    const clearedGrid = createGrid(sizeRef.current, CANVAS_BASE_COLOR);
    gridRef.current = clearedGrid;
    setGrid(clearedGrid);
    rendererRef.current?.redraw(clearedGrid);
  }

  function handleSetSize() {
    const input = window.prompt("Enter the size of the grid (1-100):");
    const newSize = Number.parseInt(input ?? "", 10);
    if (newSize < 1 || newSize > 100) {
      return;
    }
    setSize(newSize);
    sizeRef.current = newSize;
    rendererRef.current?.resizeForGrid(newSize);
    const freshGrid = createGrid(newSize, CANVAS_BASE_COLOR);
    gridRef.current = freshGrid;
    setGrid(freshGrid);
    rendererRef.current?.redraw(freshGrid);
    animationControllerRef.current?.reset();
    setSelectedFrameIndex(null);
  }

  function handleAddFrame() {
    animationControllerRef.current?.addFrame(gridRef.current);
    const next = createGrid(sizeRef.current, CANVAS_BASE_COLOR);
    gridRef.current = next;
    setGrid(next);
    rendererRef.current?.redraw(next);
  }

  function handleTogglePlay() {
    animationControllerRef.current?.togglePlayback();
  }

  const handleSelectFrame = useCallback((index) => {
    if (index === null) {
      setSelectedFrameIndex(null);
      return;
    }
    const ok = animationControllerRef.current?.selectFrame(index);
    if (ok) {
      setSelectedFrameIndex(index);
    }
  }, []);

  function handleSelectDrawBrush() {
    setDrawMode("draw");
  }

  function handleToggleErase() {
    setDrawMode((mode) => (mode === "erase" ? "draw" : "erase"));
  }

  return (
    <div className="page">
      <FrameTimeline
        frames={frames}
        selectedFrameIndex={selectedFrameIndex}
        canvasBaseColor={CANVAS_BASE_COLOR}
        onSelectFrame={handleSelectFrame}
      />

      <div className="app-layout">
        <div className="sidebar">
          <BrushColorControls brushRgb={brushRgb} setBrushRgb={setBrushRgb} />
          <DrawToolControls
            isDrawActive={isDrawMode}
            isErase={isEraseMode}
            onDrawBrush={handleSelectDrawBrush}
            onErase={handleToggleErase}
          />
          <button type="button" onClick={handleClear}>Clear</button>
          <button type="button" onClick={handleSetSize}>Set Size</button>
        </div>

        <canvas id="canvas" ref={canvasRef} />

        <div className="animation-bar">
          <button type="button" onClick={handleTogglePlay}>{isPlaying ? "Stop" : "Play"}</button>
          <button type="button" onClick={handleAddFrame}>Add Frame ({frameCount})</button>
        </div>
      </div>
    </div>
  );
}
