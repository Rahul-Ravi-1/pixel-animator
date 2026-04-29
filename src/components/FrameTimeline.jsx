import { useEffect } from "react";

const FRAME_THUMBNAIL_SIZE = 52;

function drawFrameThumbnail(thumbnailCanvas, frame, canvasBaseColor) {
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

export default function FrameTimeline({
  frames,
  selectedFrameIndex,
  canvasBaseColor,
  onSelectFrame,
}) {
  useEffect(() => {
    function handlePointerDown(event) {
      if (selectedFrameIndex === null) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (target.closest(".frame-item")) {
        return;
      }
      onSelectFrame(null);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [selectedFrameIndex, onSelectFrame]);

  function handleFrameItemKeyDown(event, index) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectFrame(index);
    }
  }

  return (
    <div className="animation-frame-container">
      <div className="frame-timeline">
        {frames.map((frame, index) => (
          <div
            key={index}
            className={`frame-item${selectedFrameIndex === index ? " frame-item--selected" : ""}`}
            role="button"
            tabIndex={0}
            aria-current={selectedFrameIndex === index ? "true" : undefined}
            aria-label={`Frame ${index + 1}, select to edit on canvas`}
            onClick={() => onSelectFrame(index)}
            onKeyDown={(event) => handleFrameItemKeyDown(event, index)}
          >
            <canvas
              className="frame-thumb-canvas"
              width={FRAME_THUMBNAIL_SIZE}
              height={FRAME_THUMBNAIL_SIZE}
              ref={(node) => {
                if (node) {
                  drawFrameThumbnail(node, frame, canvasBaseColor);
                }
              }}
            />
            <span className="frame-label">Frame {index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
