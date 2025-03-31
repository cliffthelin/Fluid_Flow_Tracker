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
