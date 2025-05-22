
import React, { useState, useEffect, useCallback } from 'react';
import { PlayIcon, PauseIcon, StopIcon, SpeakerWaveIcon } from './icons';

interface SpeechControlsProps {
  textToRead: string;
}

// UI Text Konstanten (Deutsch) für SpeechControls
const SPEECH_UI_TEXTS = {
  speechAriaPlay: 'Vorlesen',
  speechAriaPause: 'Pause',
  speechAriaStop: 'Stop',
  speechSpeedLabel: 'Tempo:',
  speechSpeedSlow: 'Langsam (0.75x)',
  speechSpeedNormal: 'Normal (1x)',
  speechSpeedFast: 'Schnell (1.5x)',
};

const SpeechControls: React.FC<SpeechControlsProps> = ({ textToRead }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const speechLang = 'de-DE'; // Fest auf Deutsch

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(textToRead);
    u.lang = speechLang;
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
      if (synth.speaking) {
         synth.cancel();
      }
    };
  }, [textToRead, speechLang]);

  useEffect(() => {
    if (utterance) {
      utterance.rate = speechSpeed;
      utterance.lang = speechLang;
    }
  }, [speechSpeed, utterance, speechLang]);

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
      utterance.text = textToRead; 
      utterance.lang = speechLang;
      synth.cancel(); 
      synth.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    }
  }, [isSpeaking, isPaused, utterance, textToRead, speechLang]);

  const handleStop = useCallback(() => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const speedOptions = [
    { label: SPEECH_UI_TEXTS.speechSpeedSlow, value: 0.75 },
    { label: SPEECH_UI_TEXTS.speechSpeedNormal, value: 1 },
    { label: SPEECH_UI_TEXTS.speechSpeedFast, value: 1.5 },
  ];

  const playPauseAriaLabel = isSpeaking && !isPaused ? SPEECH_UI_TEXTS.speechAriaPause : SPEECH_UI_TEXTS.speechAriaPlay;

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={playPauseAriaLabel}
          >
            {isSpeaking && !isPaused ? <PauseIcon className="w-5 h-5 text-primary" /> : <PlayIcon className="w-5 h-5 text-primary" />}
          </button>
          <button
            onClick={handleStop}
            disabled={!isSpeaking}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={SPEECH_UI_TEXTS.speechAriaStop}
          >
            <StopIcon className="w-5 h-5 text-gray-600" />
          </button>
          <SpeakerWaveIcon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="speechSpeed" className="text-sm text-gray-700">{SPEECH_UI_TEXTS.speechSpeedLabel}</label>
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