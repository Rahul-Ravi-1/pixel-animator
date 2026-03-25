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
(function () {

/**
 * So just like the animation controller, this is like a constructor for the timeline view
 * The cool thing about this is instead of defining whole functions you can pass variables
 * Since app.js has baseColor, frameSize and frameTimeline, you can pass them to the constructor 
 * and use them simply as variables in the function. Again, another way to make the code more modular and easier to maintain
 * 
 */
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

(function () {
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
      
      function createFrameTimelineItem(index, frame) {
        if (!Array.isArray(frame) || frame.length === 0) {
          return null;
        }

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

      window.timelineView = {
        renderFrameTimeline,
        createFrameTimelineItem,
      };
      return {
        renderFrameTimeline,
      };






})();
