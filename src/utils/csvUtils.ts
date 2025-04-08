import { LogEntry } from '../types/LogEntry';

/**
 * Converts log entries to CSV format and triggers a download.
 * @param logs Array of LogEntry objects.
 * @param filename Optional filename for the downloaded CSV.
 */
export const exportToCsv = (logs: LogEntry[], filename: string = 'flow_tracker_logs.csv') => {
  if (!logs || logs.length === 0) {
    alert('No logs to export.');
    return;
  }

  const headers = ['Date', 'Time', 'Duration (s)', 'Volume (ml)', 'Rate (ml/s)'];

  // Sort logs by date/time ascending (oldest first) for standard CSV export
  const sortedLogs = [...logs].sort((a, b) => {
      try {
        // Attempt to create Date objects for comparison
        // Assumes date format is compatible with new Date() e.g., MM/DD/YYYY or YYYY-MM-DD
        // Assumes time format is compatible e.g., HH:MM:SS
        const dateA = new Date(`${a.date} ${a.timeOfDay}`);
        const dateB = new Date(`${b.date} ${b.timeOfDay}`);

        // Handle cases where date parsing might fail
        if (isNaN(dateA.getTime())) return 1; // Treat invalid date A as greater (move to end)
        if (isNaN(dateB.getTime())) return -1; // Treat invalid date B as smaller (move to start)

        return dateA.getTime() - dateB.getTime(); // Ascending order
      } catch (e) {
        console.error("Error parsing date/time for sorting:", a, b, e);
        return 0; // Maintain original order if parsing fails
      }
  });


  const rows = sortedLogs.map(log => [
    `"${log.date}"`, // Enclose in quotes in case date format contains commas
    `"${log.timeOfDay}"`, // Enclose in quotes
    log.durationSeconds.toFixed(2),
    log.volumeMl.toFixed(1),
    log.rateMlPerSecond.toFixed(2)
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create a Blob and trigger download
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up Blob URL
    } else {
      // Fallback or error for browsers not supporting download attribute
      alert('CSV export download is not fully supported in your browser. Please try copying the data or using a different browser.');
    }
  } catch (error) {
      console.error("Error creating or downloading CSV:", error);
      alert('An error occurred during CSV export.');
  }
};


/**
 * Parses CSV content into an array of LogEntry objects.
 * Expects headers: 'Date', 'Time', 'Duration (s)', 'Volume (ml)', 'Rate (ml/s)'
 * @param csvContent The raw CSV string content.
 * @returns A promise that resolves with an array of LogEntry objects or rejects with an error.
 */
export const parseCsvToLogs = (csvContent: string): Promise<LogEntry[]> => {
  return new Promise((resolve, reject) => {
    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        return reject(new Error('CSV file must contain headers and at least one data row.'));
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '')); // Remove quotes if present
      const expectedHeaders = ['Date', 'Time', 'Duration (s)', 'Volume (ml)', 'Rate (ml/s)'];

      // Basic header validation
      if (headers.length !== expectedHeaders.length || !expectedHeaders.every((h, i) => h === headers[i])) {
         return reject(new Error(`Invalid CSV headers. Expected: "${expectedHeaders.join(', ')}", Got: "${headers.join(', ')}"`));
      }

      const importedLogs: LogEntry[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        // Basic CSV parsing (doesn't handle commas within quoted fields perfectly, but works for simple cases)
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, '')); // Remove quotes

        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Incorrect number of columns. Expected ${headers.length}, got ${values.length}. Skipping row.`);
          continue;
        }

        const [dateStr, timeStr, durationStr, volumeStr, rateStr] = values;

        const durationSeconds = parseFloat(durationStr);
        const volumeMl = parseFloat(volumeStr);
        const rateMlPerSecond = parseFloat(rateStr);

        // Basic data validation
        let rowIsValid = true;
        if (!dateStr || typeof dateStr !== 'string') {
            errors.push(`Row ${i + 1}: Invalid or missing Date. Skipping row.`);
            rowIsValid = false;
        }
        if (!timeStr || typeof timeStr !== 'string') {
            errors.push(`Row ${i + 1}: Invalid or missing Time. Skipping row.`);
            rowIsValid = false;
        }
        if (isNaN(durationSeconds) || durationSeconds < 0) {
            errors.push(`Row ${i + 1}: Invalid or missing Duration (must be a non-negative number). Value: "${durationStr}". Skipping row.`);
            rowIsValid = false;
        }
        if (isNaN(volumeMl) || volumeMl < 0) {
            errors.push(`Row ${i + 1}: Invalid or missing Volume (must be a non-negative number). Value: "${volumeStr}". Skipping row.`);
            rowIsValid = false;
        }
         // Rate is derived, but we can check if the provided one is valid
        if (isNaN(rateMlPerSecond) || rateMlPerSecond < 0) {
            errors.push(`Row ${i + 1}: Invalid or missing Rate (must be a non-negative number). Value: "${rateStr}". Skipping row.`);
            rowIsValid = false;
        }

        // Optional: More robust date/time validation if needed
        // try {
        //   const testDate = new Date(`${dateStr} ${timeStr}`);
        //   if (isNaN(testDate.getTime())) throw new Error();
        // } catch {
        //   errors.push(`Row ${i + 1}: Could not parse Date/Time combination "${dateStr} ${timeStr}". Skipping row.`);
        //   rowIsValid = false;
        // }


        if (rowIsValid) {
          importedLogs.push({
            id: crypto.randomUUID(), // Generate a new ID for imported entries
            date: dateStr,
            timeOfDay: timeStr,
            durationSeconds: parseFloat(durationSeconds.toFixed(2)),
            volumeMl: parseFloat(volumeMl.toFixed(1)),
            rateMlPerSecond: parseFloat(rateMlPerSecond.toFixed(2)), // Use parsed rate, could also recalculate
          });
        }
      }

      if (errors.length > 0) {
        // Resolve successfully but include errors for the user to see
        console.warn("CSV Import encountered issues:\n" + errors.join('\n'));
        alert("CSV Import finished with some issues:\n\n" + errors.join('\n') + "\n\nOnly valid rows were imported.");
      }

      if (importedLogs.length === 0 && lines.length > 1 && errors.length > 0) {
          return reject(new Error("No valid log entries found in the CSV file after processing. Please check the file format and content."));
      }

      resolve(importedLogs);

    } catch (error) {
      console.error("Error parsing CSV:", error);
      reject(new Error(`Failed to parse CSV file. ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};
