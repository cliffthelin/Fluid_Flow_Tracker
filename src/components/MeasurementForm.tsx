import React, { useState, useCallback } from 'react';
import { Play, Square, Save, RotateCcw } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { LogEntry } from '../types/LogEntry';

interface MeasurementFormProps {
  onSave: (entry: LogEntry) => void;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ onSave }) => {
  const { isRunning, elapsedTime, formattedTime, start, stop, reset } = useTimer();
  const [volume, setVolume] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setVolume(value);
      if (error) setError(null); // Clear error when user types valid input
    }
  };

  const handleSave = useCallback(() => {
    setError(null); // Clear previous errors
    const volumeMl = parseFloat(volume);
    const durationSeconds = elapsedTime / 1000;

    // Validation
    if (isRunning) {
        setError('Please stop the timer before saving.');
        return;
    }
    if (durationSeconds <= 0) {
        setError('Timer was not run or duration is zero.');
        return;
    }
    if (isNaN(volumeMl) || volumeMl <= 0) {
      setError('Please enter a valid positive volume.');
      return;
    }

    const now = new Date();
    const rateMlPerSecond = durationSeconds > 0 ? volumeMl / durationSeconds : 0;

    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      date: now.toLocaleDateString(), // Use locale-specific date format
      timeOfDay: now.toLocaleTimeString(), // Use locale-specific time format
      durationSeconds: parseFloat(durationSeconds.toFixed(2)),
      volumeMl: parseFloat(volumeMl.toFixed(1)), // Consistent precision
      rateMlPerSecond: parseFloat(rateMlPerSecond.toFixed(2)),
    };

    onSave(newEntry);
    setVolume('');
    reset(); // Reset timer and internal state
  }, [volume, elapsedTime, onSave, reset, isRunning, error]);

  const handleReset = () => {
    reset(); // Reset timer hook
    setVolume(''); // Clear volume input
    setError(null); // Clear any errors
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-center text-indigo-700">New Measurement</h2>

      {/* Timer Display */}
      <div className="text-center mb-5">
        <p className="text-6xl font-mono font-bold text-gray-800 tracking-tight">{formattedTime}</p>
        <p className="text-sm text-gray-500 mt-1">MM:SS.ms</p>
      </div>

      {/* Timer Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        {!isRunning ? (
          <button
            onClick={start}
            className="flex items-center justify-center px-5 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-60"
            disabled={isRunning}
            aria-label="Start Timer"
          >
            <Play size={20} className="mr-1.5" /> Start
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex items-center justify-center px-5 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-60"
            disabled={!isRunning}
            aria-label="Stop Timer"
          >
            <Square size={20} className="mr-1.5" /> Stop
          </button>
        )}
         <button
            onClick={handleReset}
            className="flex items-center justify-center px-5 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150 ease-in-out"
            aria-label="Reset Timer and Volume"
          >
            <RotateCcw size={20} className="mr-1.5" /> Reset
          </button>
      </div>

      {/* Volume Input */}
      <div className="mb-5">
        <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-1">
          Volume (ml)
        </label>
        <input
          type="text" // Use text to allow decimal input easily, validation handles non-numbers
          inputMode="decimal" // Hint for mobile keyboards
          id="volume"
          value={volume}
          onChange={handleVolumeChange}
          placeholder="e.g., 350.5"
          className={`w-full px-3 py-2 border ${error && (isNaN(parseFloat(volume)) || parseFloat(volume) <= 0) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out`}
          disabled={isRunning} // Disable input while timer is running
          aria-invalid={!!error && (isNaN(parseFloat(volume)) || parseFloat(volume) <= 0)}
          aria-describedby={error ? "volume-error" : undefined}
        />
         {error && (isNaN(parseFloat(volume)) || parseFloat(volume) <= 0) && (
           <p id="volume-error" className="text-red-600 text-xs mt-1">{error}</p>
         )}
      </div>

       {/* General Error Message (for timer-related errors) */}
       {error && !(isNaN(parseFloat(volume)) || parseFloat(volume) <= 0) && (
        <p className="text-red-600 text-sm mb-4 text-center bg-red-50 p-2 rounded border border-red-200">{error}</p>
      )}


      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isRunning || !volume || elapsedTime === 0 || !!error}
        className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Save Measurement"
      >
        <Save size={20} className="mr-2" /> Save Measurement
      </button>
    </div>
  );
};

export default MeasurementForm;
