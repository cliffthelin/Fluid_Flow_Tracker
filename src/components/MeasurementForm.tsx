import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Play, Square, Save, RotateCcw, Activity } from 'lucide-react'; // Added Activity icon
import { useTimer } from '../hooks/useTimer';
import { LogEntry } from '../types/LogEntry';

interface MeasurementFormProps {
  onSave: (entry: LogEntry) => void;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ onSave }) => {
  const { isRunning, elapsedTime, formattedTime, start, stop, reset } = useTimer();
  const [volume, setVolume] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [calculatedRate, setCalculatedRate] = useState<number | null>(null);
  const [urgency, setUrgency] = useState<number | null>(null);
  const [urineColor, setUrineColor] = useState<string>('');
  const [showColorIndicator, setShowColorIndicator] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setVolume(value);
      if (error && !error.includes('timer')) setError(null); // Clear volume-specific error
    }
  };

  // Calculate rate in real-time when volume or time changes (but only if timer stopped)
  useEffect(() => {
    if (!isRunning && elapsedTime > 0 && volume) {
      const volumeMl = parseFloat(volume);
      const durationSeconds = elapsedTime / 1000;
      if (!isNaN(volumeMl) && volumeMl > 0 && durationSeconds > 0) {
        const rate = volumeMl / durationSeconds;
        setCalculatedRate(rate);
        if (error && error.includes('volume')) setError(null); // Clear volume error if now valid
      } else {
        setCalculatedRate(null); // Reset if volume is invalid
      }
    } else {
      setCalculatedRate(null); // Reset if timer running or no time/volume
    }
  }, [volume, elapsedTime, isRunning, error]); // Include error to potentially clear it

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
      setCalculatedRate(null); // Ensure calculated rate is cleared on error
      return;
    }

    // Use the already calculated rate if available, otherwise calculate again
    const rateMlPerSecond = calculatedRate !== null ? calculatedRate : (volumeMl / durationSeconds);

    const now = new Date();
    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      date: now.toLocaleDateString(),
      timeOfDay: now.toLocaleTimeString(),
      durationSeconds: parseFloat(durationSeconds.toFixed(2)),
      volumeMl: parseFloat(volumeMl.toFixed(1)),
      rateMlPerSecond: parseFloat(rateMlPerSecond.toFixed(2)),
      urgency: urgency,
      urineColor: urineColor,
    };

    onSave(newEntry);
    setVolume('');
    reset(); // Reset timer and internal state
    setCalculatedRate(null); // Clear calculated rate display
    setUrgency(null);
    setUrineColor('');
    setShowColorIndicator(false);
  }, [volume, elapsedTime, onSave, reset, isRunning, calculatedRate, urgency, urineColor]); // Added calculatedRate

  const handleReset = () => {
    reset(); // Reset timer hook
    setVolume(''); // Clear volume input
    setError(null); // Clear any errors
    setCalculatedRate(null); // Clear calculated rate display
    setUrgency(null);
    setUrineColor('');
    setShowColorIndicator(false);
  };

  // Memoize the error check for the input border for performance
  const isVolumeInvalid = useMemo(() => {
    return !!error && (isNaN(parseFloat(volume)) || parseFloat(volume) <= 0);
  }, [error, volume]);

  const urineColorOptions = [
    { value: '', label: 'Select a color' },
    { value: 'Light Yellow to Amber', label: 'Light Yellow to Amber (Pale Straw to Honey)' },
    { value: 'Clear', label: 'Clear' },
    { value: 'Dark Yellow', label: 'Dark Yellow' },
    { value: 'Amber or Honey', label: 'Amber or Honey' },
    { value: 'Orange', label: 'Orange' },
    { value: 'Pink or Red', label: 'Pink or Red' },
    { value: 'Blue or Green', label: 'Blue or Green' },
    { value: 'Brown or Cola-Colored', label: 'Brown or Cola-Colored' },
    { value: 'Cloudy or Murky', label: 'Cloudy or Murky' },
    { value: 'Foamy or Bubbly', label: 'Foamy or Bubbly' },
  ];

  const urineColorIndications = {
    'Light Yellow to Amber': 'Normal. Indicates proper hydration. Lighter shades = more hydrated.',
    Clear: 'Very hydrated or overhydrated. Not usually dangerous, but can indicate you\'re drinking more water than needed.',
    'Dark Yellow': 'Mild dehydration. Time to drink more water.',
    'Amber or Honey': 'Dehydrated. Body needs more fluids soon.',
    Orange: 'Possible causes: Dehydration, Liver/bile duct issues, Certain medications (e.g., rifampin, phenazopyridine), Carrots or beta-carotene in diet',
    'Pink or Red': 'Possible causes: Beets, blackberries, rhubarb, Blood in urine (hematuria) — could be due to UTI, kidney stones, or more serious conditions, Medications (e.g., rifampin)',
    'Blue or Green': 'Rare, but can result from: Dyes in food or medications, Medications like amitriptyline or propofol, Certain bacterial infections',
    'Brown or Cola-Colored': 'Possible causes: Severe dehydration, Liver disease, Rhabdomyolysis (muscle breakdown), Fava beans or aloe in diet',
    'Cloudy or Murky': 'Could indicate: UTI, Kidney stones, High phosphate/crystals, Presence of pus or mucus',
    'Foamy or Bubbly': 'Persistent foam could suggest: Excess protein in urine (possible kidney issues)',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-center text-indigo-700 dark:text-indigo-300">New Measurement</h2>

      {/* Timer Display */}
      <div className="text-center mb-5">
        <p className="text-6xl font-mono font-bold text-gray-800 dark:text-gray-100 tracking-tight">{formattedTime}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">MM:SS.ms</p>
      </div>

      {/* Timer Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        {!isRunning ? (
          <button
            onClick={start}
            className="flex items-center justify-center px-5 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out disabled:opacity-60"
            disabled={isRunning}
            aria-label="Start Timer"
          >
            <Play size={20} className="mr-1.5" /> Start
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex items-center justify-center px-5 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out disabled:opacity-60"
            disabled={!isRunning}
            aria-label="Stop Timer"
          >
            <Square size={20} className="mr-1.5" /> Stop
          </button>
        )}
        <button
          onClick={handleReset}
          className="flex items-center justify-center px-5 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md shadow-sm hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out"
          aria-label="Reset Timer and Volume"
        >
          <RotateCcw size={20} className="mr-1.5" /> Reset
        </button>
      </div>

      {/* Volume Input */}
      <div className="mb-2">
        <label htmlFor="volume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Volume (ml)
        </label>
        <input
          type="text"
          inputMode="decimal"
          id="volume"
          value={volume}
          onChange={handleVolumeChange}
          placeholder="e.g., 350.5"
          className={`w-full px-3 py-2 border ${isVolumeInvalid ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 sm:text-sm transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`}
          disabled={isRunning} // Disable input while timer is running
          aria-invalid={isVolumeInvalid}
          aria-describedby={isVolumeInvalid ? "volume-error" : undefined}
        />
        {isVolumeInvalid && (
          <p id="volume-error" className="text-red-600 dark:text-red-400 text-xs mt-1">{error}</p>
        )}
      </div>

      {/* Calculated Rate Display */}
      {calculatedRate !== null && !isRunning && (
        <div className="mb-5 text-center bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center justify-center">
            <Activity size={16} className="mr-1.5 text-indigo-500 dark:text-indigo-400" /> Calculated Rate:
          </p>
          <p className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mt-1">
            {calculatedRate.toFixed(2)} <span className="text-xs font-normal">ml/s</span>
          </p>
        </div>
      )}

      {/* General Error Message (for timer-related errors) */}
      {error && !isVolumeInvalid && ( // Only show general error if it's not a volume error
        <p className="text-red-600 dark:text-red-400 text-sm mb-4 text-center bg-red-50 dark:bg-red-900/30 p-2 rounded border border-red-200 dark:border-red-800">{error}</p>
      )}

      {/* Urgency and Color Selectors */}
      {!isRunning && (
        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Urgency Input */}
          <div>
            <label htmlFor="manual-urgency" className="block text-sm font-medium text-gray-700 mb-1">
              Urgency (1-5)
            </label>
            <input
              type="number"
              id="manual-urgency"
              min="1"
              max="5"
              value={urgency ?? ''}
              onChange={e => setUrgency(Number(e.target.value))}
              placeholder="e.g., 3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>

          {/* Urine Color Input */}
          <div>
            <label htmlFor="manual-urine-color" className="block text-sm font-medium text-gray-700 mb-1">
              Urine Color
            </label>
            <select
              id="manual-urine-color"
              value={urineColor}
              onChange={e => setUrineColor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
            >
              {urineColorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Color Indicator */}
      {urineColor && urineColorIndications[urineColor] && (
        <div className="mb-4 text-center bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Urine Color Indication:
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 italic">{urineColorIndications[urineColor]}</p>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isRunning || !volume || elapsedTime === 0 || !!error}
        className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 dark:bg-indigo-700 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Save Measurement"
      >
        <Save size={20} className="mr-2" /> Save Measurement
      </button>
    </div>
  );
};

export default MeasurementForm;
