(function () {
  window.createToolModel = function createToolModel({
    initialColor = "black",
  } = {}) {
    let currentColor = initialColor;

    function generateRandomRgbColor() {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r}, ${g}, ${b})`;
    }

    function getCurrentColor() {
      return currentColor;
    }

    function getRandomColor() {
      return generateRandomRgbColor();
    }

    function setCurrentColor(nextColor) {
      currentColor = nextColor;
    }

    return {
      getCurrentColor,
      getRandomColor,
      setCurrentColor,
    };
  };
})();
