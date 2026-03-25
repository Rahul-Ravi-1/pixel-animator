(function () {
  window.createTimelineView = function createTimelineView({
    frameTimeline,
    frameThumbnailSize,
    baseColor,
  }) {
    function drawFrameThumbnail(thumbnailCanvas, frame) {
      const thumbnailContext = thumbnailCanvas.getContext("2d");
      if (!thumbnailContext || !Array.isArray(frame) || frame.length === 0) {
        return;
      }

      const frameSize = frame.length;
      const pixelSize = Math.max(1, Math.floor(frameThumbnailSize / frameSize));
      const renderedSize = pixelSize * frameSize;
      const offset = Math.floor((frameThumbnailSize - renderedSize) / 2);

      thumbnailContext.fillStyle = baseColor;
      thumbnailContext.fillRect(0, 0, frameThumbnailSize, frameThumbnailSize);

      for (let x = 0; x < frameSize; x++) {
        for (let y = 0; y < frameSize; y++) {
          thumbnailContext.fillStyle = frame[x][y];
          thumbnailContext.fillRect(offset + x * pixelSize, offset + y * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    function createFrameTimelineItem(index, frame) {
      const frameItem = document.createElement("div");
      frameItem.className = "frame-item";

      const frameCanvas = document.createElement("canvas");
      frameCanvas.className = "frame-thumb-canvas";
      frameCanvas.width = frameThumbnailSize;
      frameCanvas.height = frameThumbnailSize;
      drawFrameThumbnail(frameCanvas, frame);

      const frameLabel = document.createElement("span");
      frameLabel.className = "frame-label";
      frameLabel.textContent = `Frame ${index + 1}`;

      frameItem.append(frameCanvas, frameLabel);
      return frameItem;
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

    return {
      renderFrameTimeline,
    };
  };
})();
