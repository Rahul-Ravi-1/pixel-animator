(function () {
  function cloneGrid(sourceGrid) {
    return sourceGrid.map((row) => row.slice());
  }

  function isFrameShapeValid(frame) {
    return Array.isArray(frame) && frame.length > 0 && Array.isArray(frame[0]);
  }


/**
 * This is like a controller/constructor for handling animation logic
 * It's cool because when you declare an instance of this function
 * You can define the callbacks for the animation logic and call them as needed
 * onApplyFrame for example literally calls to set the frame on the canvas since frames is a variable here
 * 
 * Ultimately this is for separation of concerns and making the code more modular and easier to maintain
 * You can see how this is used in app.js with the animationController instance
 */
  window.createAnimationController = function createAnimationController({
    onApplyFrame,
    onPlayingChange,
    onFrameCountChange,
    frameDelayMs = 200,
  }) {
    let frames = [];
    let currentFrameIndex = 0;
    let playbackTimerId = null;

    function notifyPlayingChange() {
      if (onPlayingChange) {
        onPlayingChange(playbackTimerId !== null);
      }
    }

    function notifyFrameCountChange() {
      if (onFrameCountChange) {
        onFrameCountChange(frames.length);
      }
    }

    function stop() {
      if (playbackTimerId !== null) {
        clearInterval(playbackTimerId);
        playbackTimerId = null;
        notifyPlayingChange();
      }
    }

    function applyFrame(index) {
      if (!onApplyFrame || frames.length === 0) {
        return;
      }
      onApplyFrame(cloneGrid(frames[index]));
    }

    function togglePlayback() {
      if (playbackTimerId !== null) {
        stop();
        return false;
      }

      if (frames.length === 0) {
        return false;
      }

      currentFrameIndex = 0;
      applyFrame(currentFrameIndex);
      playbackTimerId = window.setInterval(() => {
        currentFrameIndex = (currentFrameIndex + 1) % frames.length;
        applyFrame(currentFrameIndex);
      }, frameDelayMs);
      notifyPlayingChange();
      return true;
    }

    function addFrame(frame) {
      if (!isFrameShapeValid(frame)) {
        return frames.length;
      }

      if (playbackTimerId !== null) {
        stop();
      }

      frames.push(cloneGrid(frame));
      notifyFrameCountChange();
      return frames.length;
    }

    function reset() {
      stop();
      frames = [];
      currentFrameIndex = 0;
      notifyFrameCountChange();
    }

    function getFrameCount() {
      return frames.length;
    }

    function getFrames() {
      return frames.map((frame) => cloneGrid(frame));
    }

    function isPlaying() {
      return playbackTimerId !== null;
    }
/**
 * This is like a public API for the animation controller this is much more straight forward
 * and easier to understand than the constructor
 */
    return {
      togglePlayback,
      addFrame,
      reset,
      stop,
      getFrameCount,
      getFrames,
      isPlaying,
    };
  };
})();
