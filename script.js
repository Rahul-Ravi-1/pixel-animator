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

let currentColorFunction = getCurrentColor;
const MAX_CANVAS_SIZE = 512;
let size = 16;
let grid = [];
let mouseDown = false;
document.body.onmousedown = () => (mouseDown = true);
document.body.onmouseup = () => (mouseDown = false);

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
//sadfasdhfkdasf

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
      }
    });
     
    // Initialize
    createGrid(size);
    updateModeButtons();