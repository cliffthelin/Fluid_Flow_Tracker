import React from 'react';
    import { LogEntry } from '../types/LogEntry';
    import { Trash2 } from 'lucide-react';

    interface LogTableProps {
      logs: LogEntry[];
      onDelete: (id: string) => void;
    }

    const LogTable: React.FC<LogTableProps> = ({ logs, onDelete }) => {

      // Sort logs by date/time descending (newest first) for display
      const sortedLogsForDisplay = [...logs].sort((a, b) => {
        try {
          const dateA = new Date(`${a.date} ${a.timeOfDay}`);
          const dateB = new Date(`${b.date} ${b.timeOfDay}`);
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          return dateB.getTime() - dateA.getTime(); // Descending order
        } catch (e) {
          console.error("Error parsing date/time for display sorting:", a, b, e);
          return 0;
        }
      });

      if (sortedLogsForDisplay.length === 0) {
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full border border-gray-200 dark:border-gray-700 mt-8 transition-colors duration-300">
            <p className="text-center text-gray-500 dark:text-gray-400">No log entries yet.</p>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-1">Start a measurement or add one manually!</p>
          </div>
        );
      }

      return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg w-full border border-gray-200 dark:border-gray-700 mt-8 transition-colors duration-300">
          <h2 className="text-2xl font-semibold mb-5 text-center text-indigo-700 dark:text-indigo-300">Measurement Log</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration (s)
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Volume (ml)
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rate (ml/s)
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Color
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedLogsForDisplay.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{entry.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{entry.timeOfDay}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right font-medium">{entry.durationSeconds.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right font-medium">{entry.volumeMl.toFixed(1)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right font-medium">{entry.rateMlPerSecond.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300">
                      {entry.urgency !== null ? entry.urgency : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300">
                      {entry.urineColor || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 dark:focus:ring-offset-gray-800 rounded p-1 transition duration-150 ease-in-out"
                        aria-label={`Delete entry from ${entry.date} ${entry.timeOfDay}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    export default LogTable;
