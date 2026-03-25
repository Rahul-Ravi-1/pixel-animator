export function createGrid(size, baseColor) {
  return Array.from({ length: size }, () => Array(size).fill(baseColor));
}

export function cloneGrid(sourceGrid) {
  return sourceGrid.map((row) => row.slice());
}

export function setPixel(grid, x, y, color) {
  const gridSize = grid.length;
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
    return false;
  }
  grid[x][y] = color;
  return true;
}
