import { useCallback, useEffect, useRef, useState } from "react";
import { createAnimationController } from "../lib/animationController";

export function useAnimationController({ applyFrame }) {
  const controllerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [frames, setFrames] = useState([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(null);

  useEffect(() => {
    controllerRef.current = createAnimationController({
      onApplyFrame: applyFrame,
      onPlayingChange(nextIsPlaying) {
        setIsPlaying(nextIsPlaying);
      },
      onFrameCountChange(nextFrameCount) {
        setFrameCount(nextFrameCount);
        setFrames(controllerRef.current?.getFrames() ?? []);
      },
    });

    controllerRef.current.reset();
    return () => {
      controllerRef.current?.stop();
    };
  }, [applyFrame]);

  useEffect(() => {
    if (frames.length === 0) {
      setSelectedFrameIndex(null);
      return;
    }
    setSelectedFrameIndex((prev) =>
      prev !== null && prev >= frames.length ? null : prev,
    );
  }, [frames.length]);

  const togglePlayback = useCallback(() => {
    controllerRef.current?.togglePlayback();
  }, []);

  const addFrame = useCallback((grid) => {
    controllerRef.current?.addFrame(grid);
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.reset();
    setSelectedFrameIndex(null);
  }, []);

  const selectFrame = useCallback((index) => {
    if (index === null) {
      setSelectedFrameIndex(null);
      return;
    }
    const ok = controllerRef.current?.selectFrame(index);
    if (ok) {
      setSelectedFrameIndex(index);
    }
  }, []);

  return {
    isPlaying,
    frameCount,
    frames,
    selectedFrameIndex,
    togglePlayback,
    addFrame,
    reset,
    selectFrame,
  };
}
