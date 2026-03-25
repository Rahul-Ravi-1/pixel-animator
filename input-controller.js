(function () {
  window.createInputController = function createInputController({
    canvas,
    getGridSize,
    getCurrentColor,
    onPaint,
  }) {
    let mouseDown = false;

    function getGridCoords(event) {
      const rect = canvas.getBoundingClientRect();
      const size = getGridSize();
      const x = Math.floor(((event.clientX - rect.left) / rect.width) * size);
      const y = Math.floor(((event.clientY - rect.top) / rect.height) * size);
      return { x, y };
    }

    function paintAtPointerEvent(event) {
      const { x, y } = getGridCoords(event);
      onPaint(x, y, getCurrentColor());
    }

    function handleMouseDown(event) {
      mouseDown = true;
      paintAtPointerEvent(event);
    }

    function handleMouseMove(event) {
      if (!mouseDown) {
        return;
      }
      paintAtPointerEvent(event);
    }

    function handleMouseUp() {
      mouseDown = false;
    }

    function bind() {
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      document.body.addEventListener("mouseup", handleMouseUp);
    }

    function unbind() {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseup", handleMouseUp);
    }

    return {
      bind,
      unbind,
    };
  };
})();
