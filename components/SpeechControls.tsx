
import React, { useState, useEffect, useCallback } from 'react';
import { PlayIcon, PauseIcon, StopIcon, SpeakerWaveIcon } from './icons';

interface SpeechControlsProps {
  textToRead: string;
}

const SpeechControls: React.FC<SpeechControlsProps> = ({ textToRead }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(textToRead);
    u.lang = 'de-DE';
    u.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    u.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setIsSpeaking(false);
        setIsPaused(false);
    };
    setUtterance(u);

    return () => {
      synth.cancel(); // Clean up speech on component unmount or text change
    };
  }, [textToRead]);

  useEffect(() => {
    if (utterance) {
      utterance.rate = speechSpeed;
    }
  }, [speechSpeed, utterance]);

  const handlePlayPause = useCallback(() => {
    const synth = window.speechSynthesis;
    if (!utterance) return;

    if (isSpeaking) {
      if (isPaused) {
        synth.resume();
        setIsPaused(false);
      } else {
        synth.pause();
        setIsPaused(true);
      }
    } else {
      // Ensure text is current before speaking
      utterance.text = textToRead; 
      synth.cancel(); // Cancel any previous speech
      synth.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    }
  }, [isSpeaking, isPaused, utterance, textToRead]);

  const handleStop = useCallback(() => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const speedOptions = [
    { label: 'Langsam (0.75x)', value: 0.75 },
    { label: 'Normal (1x)', value: 1 },
    { label: 'Schnell (1.5x)', value: 1.5 },
  ];

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={isSpeaking && !isPaused ? "Pause" : "Vorlesen"}
          >
            {isSpeaking && !isPaused ? <PauseIcon className="w-5 h-5 text-primary" /> : <PlayIcon className="w-5 h-5 text-primary" />}
          </button>
          <button
            onClick={handleStop}
            disabled={!isSpeaking}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Stop"
          >
            <StopIcon className="w-5 h-5 text-gray-600" />
          </button>
          <SpeakerWaveIcon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="speechSpeed" className="text-sm text-gray-700">Tempo:</label>
          <select
            id="speechSpeed"
            value={speechSpeed}
            onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
            className="p-1.5 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
          >
            {speedOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SpeechControls;
