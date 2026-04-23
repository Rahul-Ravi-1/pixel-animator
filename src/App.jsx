import { useEffect, useMemo, useRef, useState } from "react";
import BrushColorControls from "./components/BrushColorControls";
import DrawToolControls from "./components/DrawToolControls";
import { createAnimationController } from "./lib/animationController";
import { createCanvasInputController } from "./lib/canvasInputController";
import { createCanvasRenderer } from "./lib/canvasRenderer";
import { cloneGrid, createGrid, setPixel } from "./lib/gridModel";

const CANVAS_BASE_COLOR = "#ffffff";
const MAX_CANVAS_SIZE = 512;
const FRAME_THUMBNAIL_SIZE = 52;

function brushRgbToCss({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

function drawFrameThumbnail(thumbnailCanvas, frame) {
  const thumbnailContext = thumbnailCanvas.getContext("2d");
  if (!thumbnailContext || !Array.isArray(frame) || frame.length === 0) {
    return;
  }

  const frameSize = frame.length;
  const pixelSize = Math.max(1, Math.floor(FRAME_THUMBNAIL_SIZE / frameSize));
  const renderedSize = pixelSize * frameSize;
  const offset = Math.floor((FRAME_THUMBNAIL_SIZE - renderedSize) / 2);

  thumbnailContext.fillStyle = CANVAS_BASE_COLOR;
  thumbnailContext.fillRect(0, 0, FRAME_THUMBNAIL_SIZE, FRAME_THUMBNAIL_SIZE);

  for (let x = 0; x < frameSize; x++) {
    for (let y = 0; y < frameSize; y++) {
      thumbnailContext.fillStyle = frame[x][y];
      thumbnailContext.fillRect(offset + x * pixelSize, offset + y * pixelSize, pixelSize, pixelSize);
    }
  }
}

export default function App() {
  const [size, setSize] = useState(16);
  const [grid, setGrid] = useState(() => createGrid(16, CANVAS_BASE_COLOR));
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [frames, setFrames] = useState([]);
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

  function handleSelectDrawBrush() {
    setDrawMode("draw");
  }

  function handleToggleErase() {
    setDrawMode((mode) => (mode === "erase" ? "draw" : "erase"));
  }

  return (
    <div className="page">
      <div className="animation-frame-container">
        <div className="frame-timeline">
          {frames.map((frame, index) => (
            <div key={index} className="frame-item">
              <canvas
                className="frame-thumb-canvas"
                width={FRAME_THUMBNAIL_SIZE}
                height={FRAME_THUMBNAIL_SIZE}
                ref={(node) => {
                  if (node) {
                    drawFrameThumbnail(node, frame);
                  }
                }}
              />
              <span className="frame-label">Frame {index + 1}</span>
            </div>
          ))}
        </div>
      </div>

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
