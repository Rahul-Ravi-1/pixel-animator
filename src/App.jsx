import { useEffect, useMemo, useRef, useState } from "react";
import { createAnimationController } from "./lib/animationController";
import { createCanvasRenderer } from "./lib/canvasRenderer";
import { cloneGrid, createGrid, setPixel } from "./lib/gridModel";

const CANVAS_BASE_COLOR = "#ffffff";
const MAX_CANVAS_SIZE = 512;
const FRAME_THUMBNAIL_SIZE = 52;

function generateRandomRgbColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
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
  const [colorMode, setColorMode] = useState("current");

  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const animationControllerRef = useRef(null);
  const mouseDownRef = useRef(false);
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

  const isColorMode = drawMode === "draw" && colorMode === "current";
  const isRandomMode = drawMode === "draw" && colorMode === "random";
  const isEraseMode = drawMode === "erase";

  const resolvePaintColor = useMemo(() => {
    if (drawMode === "erase") {
      return () => CANVAS_BASE_COLOR;
    }
    if (colorMode === "random") {
      return () => generateRandomRgbColor();
    }
    return () => "black";
  }, [drawMode, colorMode]);

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

  function getGridCoords(event) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: -1, y: -1 };
    }
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * sizeRef.current);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * sizeRef.current);
    return { x, y };
  }

  function handleMouseDown(event) {
    mouseDownRef.current = true;
    const { x, y } = getGridCoords(event);
    applyPaint(x, y);
  }

  function handleMouseMove(event) {
    if (!mouseDownRef.current) {
      return;
    }
    const { x, y } = getGridCoords(event);
    applyPaint(x, y);
  }

  useEffect(() => {
    function handleMouseUp() {
      mouseDownRef.current = false;
    }
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

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
          <button type="button" onClick={() => { setDrawMode("draw"); setColorMode("current"); }}>
            {isColorMode ? "Color ✓" : "Color"}
          </button>
          <button type="button" onClick={() => { setDrawMode("draw"); setColorMode((mode) => (mode === "random" ? "current" : "random")); }}>
            {isRandomMode ? "Random ✓" : "Random"}
          </button>
          <button type="button" onClick={() => { setColorMode("current"); setDrawMode((mode) => (mode === "erase" ? "draw" : "erase")); }}>
            {isEraseMode ? "Erase ✓" : "Erase"}
          </button>
          <button type="button" onClick={handleClear}>Clear</button>
          <button type="button" onClick={handleSetSize}>Set Size</button>
        </div>

        <canvas id="canvas" ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} />

        <div className="animation-bar">
          <button type="button" onClick={handleTogglePlay}>{isPlaying ? "Stop" : "Play"}</button>
          <button type="button" onClick={handleAddFrame}>Add Frame ({frameCount})</button>
        </div>
      </div>
    </div>
  );
}
