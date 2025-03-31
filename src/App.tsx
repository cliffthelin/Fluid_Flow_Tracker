import React, { useState, useCallback } from 'react';
import { Droplet, FileText, Download, PlusCircle, XCircle } from 'lucide-react'; // Added more icons
import MeasurementForm from './components/MeasurementForm';
import ManualEntryForm from './components/ManualEntryForm';
import LogTable from './components/LogTable';
import useLocalStorage from './hooks/useLocalStorage';
import { LogEntry } from './types/LogEntry';
import { exportToCsv } from './utils/csvUtils';

function App() {
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('urinationLogs', []);
  const [showManualForm, setShowManualForm] = useState(false);

  const handleSaveLog = useCallback((newEntry: LogEntry) => {
    setLogs(prevLogs => {
        const updatedLogs = [...prevLogs, newEntry];
        // No need to sort here anymore, sorting is handled in LogTable for display
        // and in exportToCsv for export. Storing order doesn't strictly matter.
        return updatedLogs;
    });
    setShowManualForm(false); // Hide manual form after successful save
  }, [setLogs]);

  const handleDeleteLog = useCallback((idToDelete: string) => {
    // Optional: Add confirmation dialog
    // if (window.confirm("Are you sure you want to delete this log entry?")) {
       setLogs(prevLogs => prevLogs.filter(log => log.id !== idToDelete));
    // }
  }, [setLogs]);

  const handleExport = useCallback(() => {
    exportToCsv(logs); // Pass the current logs state
  }, [logs]);

  const toggleManualForm = () => {
    setShowManualForm(prev => !prev);
  };

  const handleCancelManualForm = () => {
    setShowManualForm(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left mb-10 w-full max-w-4xl">
         <Droplet size={48} className="text-indigo-600 mb-2 sm:mb-0 sm:mr-4" />
         <div>
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Flow Tracker</h1>
            <p className="text-lg text-gray-600 mt-1">Monitor Your Measurements</p>
         </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex flex-col items-center space-y-8 max-w-4xl">

        {/* Conditional Rendering: Show Timer Form OR Manual Form */}
        {!showManualForm ? (
          <>
            {/* Measurement Timer Form */}
            <MeasurementForm onSave={handleSaveLog} />

            {/* Toggle Button for Manual Form */}
            <button
              onClick={toggleManualForm}
              className="flex items-center justify-center px-5 py-2.5 bg-purple-600 text-white font-medium rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-150 ease-in-out"
              aria-controls="manual-entry-form"
              aria-expanded={showManualForm}
            >
              <PlusCircle size={20} className="mr-2" />
              Add Manual Entry
            </button> {/* Removed semicolon here */}
          </>
        ) : (
          /* Manual Entry Form */
          <ManualEntryForm
            onSave={handleSaveLog}
            onCancel={handleCancelManualForm}
            aria-labelledby="manual-entry-heading"
            id="manual-entry-form"
           />
        )}


        {/* Log Table and Export Button Section */}
        <div className="w-full">
           {logs.length > 0 && (
             <div className="flex justify-end mb-4">
                <button
                    onClick={handleExport}
                    className="flex items-center justify-center px-5 py-2 bg-blue-500 text-white font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                    aria-label="Export logs to CSV"
                >
                    <Download size={20} className="mr-2" /> Export CSV
                </button>
             </div>
           )}
          {/* Log Table */}
          <LogTable logs={logs} onDelete={handleDeleteLog} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Flow Tracker. Track responsibly.</p>
      </footer>
    </div>
  );
}

export default App;
