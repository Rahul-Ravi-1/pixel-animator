(function () {
  function cloneGrid(sourceGrid) {
    return sourceGrid.map((row) => row.slice());
  }

  function isFrameShapeValid(frame) {
    return Array.isArray(frame) && frame.length > 0 && Array.isArray(frame[0]);
  }

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
