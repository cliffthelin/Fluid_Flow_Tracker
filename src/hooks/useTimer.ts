import { useState, useRef, useCallback, useEffect } from 'react';

export const useTimer = (initialState = { isRunning: false, elapsedTime: 0 }) => {
  const [isRunning, setIsRunning] = useState(initialState.isRunning);
  const [elapsedTime, setElapsedTime] = useState(initialState.elapsedTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - elapsedTime;
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - (startTimeRef.current ?? Date.now()));
      }, 10); // Update every 10ms for smoother display
      setIsRunning(true);
    }
  }, [isRunning, elapsedTime]);

  const stop = useCallback(() => {
    if (isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsRunning(false);
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setElapsedTime(0);
    startTimeRef.current = null;
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeMs % 1000) / 10); // Show hundredths of a second
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return {
    isRunning,
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    start,
    stop,
    reset,
  };
};
