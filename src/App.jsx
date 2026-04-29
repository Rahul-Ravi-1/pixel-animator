import BrushColorControls from "./components/BrushColorControls";
import DrawToolControls from "./components/DrawToolControls";
import FrameTimeline from "./components/FrameTimeline";
import { useAnimationController } from "./hooks/useAnimationController";
import { useDrawTool } from "./hooks/useDrawTool";
import { usePixelCanvas } from "./hooks/usePixelCanvas";

const CANVAS_BASE_COLOR = "#ffffff";
const MAX_CANVAS_SIZE = 512;

export default function App() {
  const {
    brushRgb,
    setBrushRgb,
    isDrawMode,
    isEraseMode,
    selectDrawBrush,
    toggleErase,
    getPaintColor,
  } = useDrawTool({ canvasBaseColor: CANVAS_BASE_COLOR });

  const {
    canvasRef,
    clear,
    resizeGrid,
    applyFrame,
    resetToBlankCanvas,
    getGrid,
  } = usePixelCanvas({
    getPaintColor,
    canvasBaseColor: CANVAS_BASE_COLOR,
    maxCanvasSize: MAX_CANVAS_SIZE,
  });

  const animation = useAnimationController({ applyFrame });

  function handleSetSize() {
    const input = window.prompt("Enter the size of the grid (1-100):");
    const newSize = Number.parseInt(input ?? "", 10);
    if (newSize < 1 || newSize > 100) {
      return;
    }
    resizeGrid(newSize);
    animation.reset();
  }

  function handleAddFrame() {
    animation.addFrame(getGrid());
    resetToBlankCanvas();
  }

  return (
    <div className="page">
      <FrameTimeline
        frames={animation.frames}
        selectedFrameIndex={animation.selectedFrameIndex}
        canvasBaseColor={CANVAS_BASE_COLOR}
        onSelectFrame={animation.selectFrame}
      />

      <div className="app-layout">
        <div className="sidebar">
          <BrushColorControls brushRgb={brushRgb} setBrushRgb={setBrushRgb} />
          <DrawToolControls
            isDrawActive={isDrawMode}
            isErase={isEraseMode}
            onDrawBrush={selectDrawBrush}
            onErase={toggleErase}
          />
          <button type="button" onClick={clear}>Clear</button>
          <button type="button" onClick={handleSetSize}>Set Size</button>
        </div>

        <canvas id="canvas" ref={canvasRef} />

        <div className="animation-bar">
          <button type="button" onClick={animation.togglePlayback}>{animation.isPlaying ? "Stop" : "Play"}</button>
          <button type="button" onClick={handleAddFrame}>Add Frame ({animation.frameCount})</button>
        </div>
      </div>
    </div>
  );
}
