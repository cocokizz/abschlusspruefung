
import React, { useState, useEffect } from 'react';
import { ClockIcon } from './icons';

interface TimerDisplayProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
  isRunning: boolean;
  timerLabel: string; // Wird von App.tsx übergeben
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ initialTime, onTimeUp, isRunning, timerLabel }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && isRunning) {
        onTimeUp();
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onTimeUp, isRunning]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-2 text-darkgray p-2 bg-white rounded-lg shadow">
      <ClockIcon className="w-5 h-5 text-primary" />
      <span className="text-lg font-medium">{timerLabel || "Restzeit:"} {formatTime(timeLeft)}</span>
    </div>
  );
};

export default TimerDisplay;