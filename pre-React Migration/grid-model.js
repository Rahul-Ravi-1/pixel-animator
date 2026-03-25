(function () {
  function createGrid(size, baseColor) {
    return Array.from({ length: size }, () => Array(size).fill(baseColor));
  }

  function cloneGrid(sourceGrid) {
    return sourceGrid.map((row) => row.slice());
  }

  function setPixel(grid, x, y, color) {
    const gridSize = grid.length;
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
      return false;
    }

    grid[x][y] = color;
    return true;
  }

  window.gridModel = {
    createGrid,
    cloneGrid,
    setPixel,
  };
})();
