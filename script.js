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
let currentColor = "black";
const canvasBaseColor = "#ffffff";

const clearBtn = document.querySelector("#clearBtn");
const colorBtn = document.querySelector("#colorBtn") ?? document.querySelector('[data-mode="default"]');
const randomBtn = document.querySelector("#randomBtn") ?? document.querySelector('[data-mode="random"]');
const setSizeBtn = document.querySelector("#setSizeBtn");
const eraseBtn = document.querySelector("#eraseBtn") ?? document.querySelector('[data-mode="erase"]');
const playBtn = document.querySelector("#Play");
const addFrameBtn = document.querySelector("#AddFrame");
const frameTimeline = document.getElementById("frameTimeline");
const FRAME_THUMBNAIL_SIZE = 52;

let currentColorFunction = getCurrentColor;
const MAX_CANVAS_SIZE = 512;
let size = 16;
let grid = [];
let mouseDown = false;
document.body.onmousedown = () => (mouseDown = true);
document.body.onmouseup = () => (mouseDown = false);

if (typeof window.createAnimationController !== "function") {
  throw new Error('Animation controller was not found. Ensure "animation.js" is loaded first.');
}

const animationController = window.createAnimationController({
  onApplyFrame(frame) {
    if (frame.length !== size) {
      createGrid(frame.length);
    }
    setGrid(frame);
    redrawCanvas();
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
    renderFrameTimeline(animationController.getFrames());
  },
});

function getPixelSize() {
  return Math.max(1, Math.floor(MAX_CANVAS_SIZE / size));
}

function getCanvasSize() {
  return getPixelSize() * size;
}

function generateRandomRgbColor() {
  // Generate random integers between 0 and 255 (inclusive) for each color channel
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Return the color in the CSS rgb() format using template literals
  return `rgb(${r}, ${g}, ${b})`;
}

function getCurrentColor() {
  return currentColor;
}

function getRandomColor() {
  return generateRandomRgbColor();
}

function createGrid(newSize) {
  size = newSize;
  const canvasSize = getCanvasSize();
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  grid = Array.from({ length: size }, () => Array(size).fill(canvasBaseColor));
  redrawCanvas();
}
function redrawCanvas() {
  const pixelSize = getPixelSize();
 
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      ctx.fillStyle = grid[x][y];
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
}

function setPixel(x, y, color){
  if( x < 0 || x >= size || y < 0 || y >= size){
    return;
  }
  grid[x][y] = color;
}

function drawPixel(x, y, color){
  const pixelSize = getPixelSize();
  ctx.fillStyle = color;
  ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
}

function cloneGrid(sourceGrid) {
  return sourceGrid.map((row) => row.slice());
}

function setGrid(nextGrid) {
  grid = cloneGrid(nextGrid);
}

function createFrameTimelineItem(index, frame) {
  const frameItem = document.createElement("div");
  frameItem.className = "frame-item";

  const frameCanvas = document.createElement("canvas");
  frameCanvas.className = "frame-thumb-canvas";
  frameCanvas.width = FRAME_THUMBNAIL_SIZE;
  frameCanvas.height = FRAME_THUMBNAIL_SIZE;
  drawFrameThumbnail(frameCanvas, frame);

  const frameLabel = document.createElement("span");
  frameLabel.className = "frame-label";
  frameLabel.textContent = `Frame ${index + 1}`;

  frameItem.append(frameCanvas, frameLabel);
  return frameItem;
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

  thumbnailContext.fillStyle = canvasBaseColor;
  thumbnailContext.fillRect(0, 0, FRAME_THUMBNAIL_SIZE, FRAME_THUMBNAIL_SIZE);

  for (let x = 0; x < frameSize; x++) {
    for (let y = 0; y < frameSize; y++) {
      thumbnailContext.fillStyle = frame[x][y];
      thumbnailContext.fillRect(offset + x * pixelSize, offset + y * pixelSize, pixelSize, pixelSize);
    }
  }
}

function renderFrameTimeline(frames) {
  if (!frameTimeline) {
    return;
  }

  frameTimeline.innerHTML = "";

  if (frames.length === 0) {
    return;
  }

  frames.forEach((frame, index) => {
    const frameItem = createFrameTimelineItem(index, frame);
    frameTimeline.appendChild(frameItem);
  });

  frameTimeline.lastElementChild?.scrollIntoView({
    behavior: "smooth",
    inline: "end",
    block: "nearest",
  });
}

function applyDrawPixel(x, y, color) {
  setPixel(x, y, color);
  drawPixel(x, y, color);
}

function applyErasePixel(x, y) {
  setPixel(x, y, canvasBaseColor);
  drawPixel(x, y, canvasBaseColor);
}
function getGridCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((e.clientX - rect.left) / rect.width) * size);
  const y = Math.floor(((e.clientY - rect.top) / rect.height) * size);
  return { x, y };
}

function paintAtPointerEvent(e) {
  const { x, y } = getGridCoords(e);
  const color = currentColorFunction();
  currentPixelFunction(x, y, color);
}

function updateModeButtons() {
  const isColorMode =
    currentPixelFunction === applyDrawPixel && currentColorFunction === getCurrentColor;
  const isRandom = currentColorFunction === getRandomColor;
  const isErasing =
    currentPixelFunction === applyErasePixel && currentColorFunction === getCurrentColor;

  if (colorBtn) colorBtn.textContent = isColorMode ? "Color ✓" : "Color";
  if (randomBtn) randomBtn.textContent = isRandom ? "Random ✓" : "Random";
  if (eraseBtn) eraseBtn.textContent = isErasing ? "Erase ✓" : "Erase";
}
  /* Old code that utilized divs
  container.innerHTML = "";
  const containerSize = 320;
  const pixelSize = containerSize/size;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const pixelDiv = document.createElement("div");
      pixelDiv.style.backgroundColor = "white";
      pixelDiv.style.width = `${pixelSize}px`
      pixelDiv.style.height = `${pixelSize}px`;
      pixelDiv.classList.add("pixel");
      pixelDiv.addEventListener("mousedown", () => {
        handlePixelHover(pixelDiv);
      });
      pixelDiv.addEventListener("mouseover", () => {
        if (mouseDown) {
          handlePixelHover(pixelDiv);
        }
      });
      container.appendChild(pixelDiv);
    }
  }*/

// Event listeners
    canvas.addEventListener("mousedown", (e) => {
      paintAtPointerEvent(e);
    });
     
    canvas.addEventListener("mousemove", (e) => {
      if (!mouseDown) return;
      paintAtPointerEvent(e);
    });
     
    // Buttons
    colorBtn?.addEventListener("click", () => {
      currentPixelFunction = applyDrawPixel;
      currentColorFunction = getCurrentColor;
      updateModeButtons();
    });

    clearBtn.addEventListener("click", () => {
      grid = Array.from({ length: size }, () => Array(size).fill(canvasBaseColor));
      redrawCanvas();
    });
     
    randomBtn?.addEventListener("click", () => {
      const isRandom = currentColorFunction === getRandomColor;
      if (isRandom) {
        currentColorFunction = getCurrentColor;
      } else {
        currentPixelFunction = applyDrawPixel;
        currentColorFunction = getRandomColor;
      }
      updateModeButtons();
    });

    eraseBtn?.addEventListener("click", () => {
      if (currentColorFunction !== getCurrentColor) {
        currentColorFunction = getCurrentColor;
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