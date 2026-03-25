(function () {
  window.createCanvasRenderer = function createCanvasRenderer({
    canvas,
    ctx,
    maxCanvasSize,
  }) {
    function getPixelSize(gridSize) {
      return Math.max(1, Math.floor(maxCanvasSize / gridSize));
    }

    function getCanvasSize(gridSize) {
      return getPixelSize(gridSize) * gridSize;
    }

    function resizeForGrid(gridSize) {
      const nextCanvasSize = getCanvasSize(gridSize);
      canvas.width = nextCanvasSize;
      canvas.height = nextCanvasSize;
    }

    function redraw(grid) {
      const gridSize = grid.length;
      const pixelSize = getPixelSize(gridSize);

      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          ctx.fillStyle = grid[x][y];
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    function drawPixel(x, y, color, gridSize) {
      const pixelSize = getPixelSize(gridSize);
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }

    return {
      resizeForGrid,
      redraw,
      drawPixel,
    };
  };
})();
