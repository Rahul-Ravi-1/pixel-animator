/**
 * Click-and-drag input for the pixel grid canvas. Maps client coordinates to
 * grid indices; uses pointer capture so dragging stays consistent off-canvas.
 *
 * @param {object} options
 * @param {() => number} options.getGridSize - Current grid dimension (cells per side).
 * @param {(payload: { x: number, y: number, isDragging: boolean }) => void} options.onInput
 */
export function createCanvasInputController({ getGridSize, onInput }) {
  let canvas = null;
  let pointerDown = false;
  let activePointerId = null;

  function clientToGrid(clientX, clientY) {
    if (!canvas) {
      return { x: -1, y: -1 };
    }
    const size = getGridSize();
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * size);
    const y = Math.floor(((clientY - rect.top) / rect.height) * size);
    return { x, y };
  }

  function emitFromEvent(event, isDragging) {
    const { x, y } = clientToGrid(event.clientX, event.clientY);
    onInput({ x, y, isDragging });
  }

  function endActivePointer(event) {
    if (!pointerDown) {
      return;
    }
    pointerDown = false;
    if (canvas && activePointerId != null && event?.pointerId === activePointerId) {
      try {
        canvas.releasePointerCapture(activePointerId);
      } catch {
        // ignore if capture already released
      }
    }
    activePointerId = null;
    if (event) {
      emitFromEvent(event, false);
    }
  }

  function onPointerDown(event) {
    if (event.button !== 0) {
      return;
    }
    pointerDown = true;
    activePointerId = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    emitFromEvent(event, true);
  }

  function onPointerMove(event) {
    if (!pointerDown) {
      return;
    }
    emitFromEvent(event, true);
  }

  function onPointerUp(event) {
    if (event.pointerId !== activePointerId) {
      return;
    }
    endActivePointer(event);
  }

  function onPointerCancel(event) {
    endActivePointer(event);
  }

  function onLostPointerCapture(event) {
    if (event.pointerId !== activePointerId) {
      return;
    }
    endActivePointer(event);
  }

  const boundDown = onPointerDown;
  const boundMove = onPointerMove;
  const boundUp = onPointerUp;
  const boundCancel = onPointerCancel;
  const boundLost = onLostPointerCapture;

  function detach() {
    if (!canvas) {
      return;
    }
    if (pointerDown && activePointerId != null) {
      try {
        canvas.releasePointerCapture(activePointerId);
      } catch {
        // ignore
      }
    }
    pointerDown = false;
    activePointerId = null;
    canvas.removeEventListener("pointerdown", boundDown);
    canvas.removeEventListener("pointermove", boundMove);
    canvas.removeEventListener("pointerup", boundUp);
    canvas.removeEventListener("pointercancel", boundCancel);
    canvas.removeEventListener("lostpointercapture", boundLost);
    canvas = null;
  }

  return {
    attach(el) {
      if (el === canvas) {
        return;
      }
      detach();
      canvas = el;
      canvas.addEventListener("pointerdown", boundDown);
      canvas.addEventListener("pointermove", boundMove);
      canvas.addEventListener("pointerup", boundUp);
      canvas.addEventListener("pointercancel", boundCancel);
      canvas.addEventListener("lostpointercapture", boundLost);
    },

    detach,
  };
}
