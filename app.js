/*
* So to be able to write modular code you need to have separation of concerns
* A big thing with architecture planning is to make sure how the code is wired up together in terms of logic
* Remember this is only just so the frontend is working as expected and this project is mainly more about setting things up for using a
* framework like React or Vue or Angular or Svelte or whatever you want to use
* 
* This is like the main entry point for the application. Remember to know what happens under the hood
* and how the code is wired up together in terms of logic.
*/




const canvas = document.getElementById("canvas");
if (!canvas) {
  throw new Error('Canvas element with id "canvas" was not found in index.html');
}
const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("2D context is not available for this canvas.");
}
ctx.imageSmoothingEnabled = false;

let currentPixelFunction = applyDrawPixel;
const canvasBaseColor = "#ffffff";

const FRAME_THUMBNAIL_SIZE = 52;

const clearBtn = document.querySelector("#clearBtn");
const colorBtn = document.querySelector("#colorBtn") ?? document.querySelector('[data-mode="default"]');
const randomBtn = document.querySelector("#randomBtn") ?? document.querySelector('[data-mode="random"]');
const setSizeBtn = document.querySelector("#setSizeBtn");
const eraseBtn = document.querySelector("#eraseBtn") ?? document.querySelector('[data-mode="erase"]');
const playBtn = document.querySelector("#Play");
const addFrameBtn = document.querySelector("#AddFrame");
const frameTimeline = document.getElementById("frameTimeline");



if (!window.gridModel) {
  throw new Error('Grid model was not found. Ensure "grid-model.js" is loaded first.');
}
const {
  createGrid: createGridData,
  cloneGrid: cloneGridData,
  setPixel: setGridPixel,
} = window.gridModel;
if (typeof window.createToolModel !== "function") {
  throw new Error('Tool model was not found. Ensure "tool.js" is loaded first.');
}

if (typeof window.createTimelineView !== "function") {
  throw new Error('Timeline view was not found. Ensure "timeline-view.js" is loaded first.');
}
if (typeof window.createCanvasRenderer !== "function") {
  throw new Error('Canvas renderer was not found. Ensure "canvas-renderer.js" is loaded first.');
}
if (typeof window.createInputController !== "function") {
  throw new Error('Input controller was not found. Ensure "input-controller.js" is loaded first.');
}

const toolModel = window.createToolModel({
  initialColor: "black",
});
let currentColorFunction = toolModel.getCurrentColor;
const MAX_CANVAS_SIZE = 512;
let size = 16;
let grid = [];
const canvasRenderer = window.createCanvasRenderer({
  canvas,
  ctx,
  maxCanvasSize: MAX_CANVAS_SIZE,
});
const timelineView = window.createTimelineView({
  frameTimeline,
  frameThumbnailSize: FRAME_THUMBNAIL_SIZE,
  baseColor: canvasBaseColor,
});

if (typeof window.createAnimationController !== "function") {
  throw new Error('Animation controller was not found. Ensure "animation.js" is loaded first.');
}
const animationController = window.createAnimationController({
  onApplyFrame(frame) {
    if (frame.length !== size) {
      createGrid(frame.length);
    }
    setGrid(frame);
    canvasRenderer.redraw(grid);
  },
  onPlayingChange(isPlaying) {
    if (playBtn) {
      playBtn.textContent = isPlaying ? "Stop" : "Play";
    }
  },
  onFrameCountChange(frameCount) {
    if (addFrameBtn) {
      addFrameBtn.textContent = `Add Frame (${frameCount})`;
    }
    timelineView.renderFrameTimeline(animationController.getFrames());
  },
});

function createGrid(newSize) {
  size = newSize;
  canvasRenderer.resizeForGrid(size);

  grid = createGridData(size, canvasBaseColor);
  canvasRenderer.redraw(grid);
}

function setPixel(x, y, color) {
  setGridPixel(grid, x, y, color);
}

function setGrid(nextGrid) {
  grid = cloneGridData(nextGrid);
}

function applyDrawPixel(x, y, color) {
  setPixel(x, y, color);
  canvasRenderer.drawPixel(x, y, color, size);
}

function applyErasePixel(x, y) {
  setPixel(x, y, canvasBaseColor);
  canvasRenderer.drawPixel(x, y, canvasBaseColor, size);
}

function updateModeButtons() {
  const isColorMode =
    currentPixelFunction === applyDrawPixel && currentColorFunction === toolModel.getCurrentColor;
  const isRandom = currentColorFunction === toolModel.getRandomColor;
  const isErasing =
    currentPixelFunction === applyErasePixel && currentColorFunction === toolModel.getCurrentColor;

  if (colorBtn) colorBtn.textContent = isColorMode ? "Color ✓" : "Color";
  if (randomBtn) randomBtn.textContent = isRandom ? "Random ✓" : "Random";
  if (eraseBtn) eraseBtn.textContent = isErasing ? "Erase ✓" : "Erase";
}

// Event listeners
const inputController = window.createInputController({
  canvas,
  getGridSize: () => size,
  getCurrentColor: () => currentColorFunction(),
  onPaint: (x, y, color) => {
    currentPixelFunction(x, y, color);
  },
});
inputController.bind();

// Buttons
colorBtn?.addEventListener("click", () => {
  currentPixelFunction = applyDrawPixel;
  currentColorFunction = toolModel.getCurrentColor;
  updateModeButtons();
});

clearBtn.addEventListener("click", () => {
  grid = createGridData(size, canvasBaseColor);
  canvasRenderer.redraw(grid);
});

randomBtn?.addEventListener("click", () => {
  const isRandom = currentColorFunction === toolModel.getRandomColor;
  if (isRandom) {
    currentColorFunction = toolModel.getCurrentColor;
  } else {
    currentPixelFunction = applyDrawPixel;
    currentColorFunction = toolModel.getRandomColor;
  }
  updateModeButtons();
});

eraseBtn?.addEventListener("click", () => {
  if (currentColorFunction !== toolModel.getCurrentColor) {
    currentColorFunction = toolModel.getCurrentColor;
  }

  const isErasing = currentPixelFunction === applyErasePixel;
  currentPixelFunction = isErasing ? applyDrawPixel : applyErasePixel;
  updateModeButtons();
});

setSizeBtn.addEventListener("click", () => {
  const input = prompt("Enter the size of the grid (1-100):");
  const newSize = Number.parseInt(input ?? "", 10);
  if (newSize >= 1 && newSize <= 100) {
    createGrid(newSize);
    animationController.reset();
  }
});

addFrameBtn?.addEventListener("click", () => {
  animationController.addFrame(grid);
});

playBtn?.addEventListener("click", () => {
  animationController.togglePlayback();
});

// Initialize
createGrid(size);
animationController.reset();
updateModeButtons();
