import React, { useState, useCallback } from 'react';
    import { Save, RotateCcw, Calendar, Clock, Thermometer, Droplets, Droplet } from 'lucide-react'; // Added more icons
    import { LogEntry } from '../types/LogEntry';

    interface ManualEntryFormProps {
      onSave: (entry: LogEntry) => void;
      onCancel: () => void; // Add cancel callback
    }

    const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onSave, onCancel }) => {
      const now = new Date();
      const [date, setDate] = useState<string>(now.toISOString().split('T')[0]); // Default to today YYYY-MM-DD
      const [time, setTime] = useState<string>(now.toTimeString().split(' ')[0].substring(0, 5)); // Default to now HH:MM
      const [duration, setDuration] = useState<string>('');
      const [volume, setVolume] = useState<string>('');
      const [urgency, setUrgency] = useState<number | null>(null);
      const [urineColor, setUrineColor] = useState<string>('');
      const [error, setError] = useState<string | null>(null);

      const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
          setter(e.target.value);
          if (error) setError(null); // Clear error on input change
        };

      const handleNumericInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          // Allow only numbers and a single decimal point for duration/volume
          if (/^\d*\.?\d*$/.test(value)) {
            setter(value);
            if (error) setError(null); // Clear error when user types valid input
          }
        };

      const resetForm = useCallback(() => {
        const currentNow = new Date();
        setDate(currentNow.toISOString().split('T')[0]);
        setTime(currentNow.toTimeString().split(' ')[0].substring(0, 5));
        setDuration('');
        setVolume('');
        setUrgency(null);
        setUrineColor('');
        setError(null);
      }, []);

      const handleSave = useCallback(() => {
        setError(null); // Clear previous errors
        const durationSeconds = parseFloat(duration);
        const volumeMl = parseFloat(volume);

        // --- Validation ---
        let validationError = null;
        if (!date || !time) {
          validationError = 'Please enter a valid date and time.';
        } else if (isNaN(durationSeconds) || durationSeconds <= 0) {
          validationError = 'Please enter a valid positive duration in seconds.';
        } else if (isNaN(volumeMl) || volumeMl <= 0) {
          validationError = 'Please enter a valid positive volume in ml.';
        }

        // Try to parse the date and time together for further validation
        let entryDateTime: Date | null = null;
        if (!validationError) {
          try {
            // Combine date and time strings. Input type="time" gives HH:MM.
            // Append :00 for seconds if needed by Date constructor.
            const timeString = time.includes(':') && time.length === 5 ? `${time}:00` : time;
            entryDateTime = new Date(`${date}T${timeString}`);
            if (isNaN(entryDateTime.getTime())) {
              throw new Error("Invalid date/time combination");
            }
            // Optional: Check if date is in the future?
            // if (entryDateTime > new Date()) {
            //   validationError = "Date and time cannot be in the future.";
            //   entryDateTime = null; // Invalidate
            // }

          } catch (e) {
            validationError = 'Invalid date or time format. Please use YYYY-MM-DD and HH:MM.';
            entryDateTime = null;
          }
        }

        if (validationError) {
          setError(validationError);
          return;
        }
        // --- End Validation ---

        // Proceed if validation passed and entryDateTime is valid
        if (entryDateTime) {
          const rateMlPerSecond = durationSeconds > 0 ? volumeMl / durationSeconds : 0;

          const newEntry: LogEntry = {
            id: crypto.randomUUID(),
            // Format date/time from the combined Date object for consistency
            date: entryDateTime.toLocaleDateString(), // Locale-specific date
            timeOfDay: entryDateTime.toLocaleTimeString(), // Locale-specific time
            durationSeconds: parseFloat(durationSeconds.toFixed(2)),
            volumeMl: parseFloat(volumeMl.toFixed(1)), // Consistent precision
            rateMlPerSecond: parseFloat(rateMlPerSecond.toFixed(2)),
            urgency: urgency,
            urineColor: urineColor,
          };

          onSave(newEntry);
          resetForm(); // Reset timer and internal state
        } else {
          // This case should theoretically be caught by validation, but acts as a safeguard
          setError("Could not process the date and time. Please check your input.");
        }

      }, [date, time, duration, volume, onSave, urgency, urineColor]);

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
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-center text-purple-700">Manual Log Entry</h2>

          {error && (
            <p className="text-red-600 text-sm mb-4 text-center bg-red-50 p-3 rounded border border-red-200">{error}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 mb-5">
            {/* Date Input */}
            <div>
              <label htmlFor="manual-date" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Calendar size={16} className="mr-1.5 text-gray-500" /> Date
              </label>
              <input
                type="date"
                id="manual-date"
                value={date}
                onChange={handleInputChange(setDate)}
                className={`w-full px-3 py-2 border ${error && (!date || (entryDateTime && isNaN(entryDateTime.getTime()))) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out`}
                aria-invalid={!!error && (!date || (entryDateTime && isNaN(entryDateTime.getTime())))} // Check if date part of error
              />
            </div>

            {/* Time Input */}
            <div>
              <label htmlFor="manual-time" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Clock size={16} className="mr-1.5 text-gray-500" /> Time
              </label>
              <input
                type="time"
                id="manual-time"
                value={time}
                onChange={handleInputChange(setTime)}
                className={`w-full px-3 py-2 border ${error && (!time || (entryDateTime && isNaN(entryDateTime.getTime()))) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out`}
                aria-invalid={!!error && (!time || (entryDateTime && isNaN(entryDateTime.getTime())))} // Check if time part of error
              />
            </div>

            {/* Duration Input */}
            <div>
              <label htmlFor="manual-duration" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Thermometer size={16} className="mr-1.5 text-gray-500" /> Duration (s)
              </label>
              <input
                type="text"
                inputMode="decimal"
                id="manual-duration"
                value={duration}
                onChange={handleNumericInputChange(setDuration)}
                placeholder="e.g., 15.5"
                className={`w-full px-3 py-2 border ${error && (isNaN(parseFloat(duration)) || parseFloat(duration) <= 0) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out`}
                aria-invalid={!!error && (isNaN(parseFloat(duration)) || parseFloat(duration) <= 0)}
              />
            </div>

            {/* Volume Input */}
            <div>
              <label htmlFor="manual-volume" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Droplets size={16} className="mr-1.5 text-gray-500" /> Volume (ml)
              </label>
              <input
                type="text"
                inputMode="decimal"
                id="manual-volume"
                value={volume}
                onChange={handleNumericInputChange(setVolume)}
                placeholder="e.g., 350.5"
                className={`w-full px-3 py-2 border ${error && (isNaN(parseFloat(volume)) || parseFloat(volume) <= 0) ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out`}
                aria-invalid={!!error && (isNaN(parseFloat(volume)) || parseFloat(volume) <= 0)}
              />
            </div>

            {/* Urgency Input */}
            <div>
              <label htmlFor="manual-urgency" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Urgency (1-5)
              </label>
              <input
                type="number"
                id="manual-urgency"
                min="1"
                max="5"
                value={urgency ?? ''}
                onChange={handleNumericInputChange(setUrgency)}
                placeholder="e.g., 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
              />
            </div>

            {/* Urine Color Input */}
            <div className="col-span-2">
              <label htmlFor="manual-urine-color" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Urine Color
              </label>
              <select
                id="manual-urine-color"
                value={urineColor}
                onChange={handleInputChange(setUrineColor)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
              >
                {urineColorOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {urineColor && urineColorIndications[urineColor] && (
                <p className="text-sm text-gray-500 mt-1 italic">{urineColorIndications[urineColor]}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              type="button" // Important: prevent form submission if wrapped in a form tag later
              onClick={onCancel} // Use the cancel callback
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150 ease-in-out order-2 sm:order-1"
              aria-label="Cancel Manual Entry"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!date || !time || !duration || !volume || !!error} // Disable if any field empty or error exists
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              aria-label="Save Manual Measurement"
            >
              <Save size={20} className="mr-2" /> Save Manual Entry
            </button>
          </div>
        </div>
      );
    };

    export default ManualEntryForm;
