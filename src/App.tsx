import React, { useState, useCallback, useRef } from 'react';
import { Download, PlusCircle, Sun, Moon, Upload, Droplet, ChevronDown, ChevronUp } from 'lucide-react';
import MeasurementForm from './components/MeasurementForm';
import ManualEntryForm from './components/ManualEntryForm';
import LogTable from './components/LogTable';
import StatsDisplay from './components/StatsDisplay';
import useLocalStorage from './hooks/useLocalStorage';
import useTheme from './hooks/useTheme';
import { LogEntry } from './types/LogEntry';
import { exportToCsv, parseCsvToLogs } from './utils/csvUtils';

function App() {
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('urinationLogs', []);
  const [showManualForm, setShowManualForm] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showMeasurementForm, setShowMeasurementForm] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showLog, setShowLog] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showAgeStats, setShowAgeStats] = useState(false);

  const handleSaveLog = useCallback((newEntry: LogEntry) => {
    setLogs(prevLogs => {
      const updatedLogs = [...prevLogs, newEntry];
      return updatedLogs.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.timeOfDay}`);
        const dateB = new Date(`${b.date} ${b.timeOfDay}`);
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB.getTime() - dateA.getTime();
      });
    });
    setShowManualForm(false);
  }, [setLogs]);

  const handleDeleteLog = useCallback((idToDelete: string) => {
    setLogs(prevLogs => prevLogs.filter(log => log.id !== idToDelete));
  }, [setLogs]);

  const handleExport = useCallback(() => {
    exportToCsv(logs);
  }, [logs]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';

    if (file.type !== 'text/csv') {
      const errorMsg = 'Invalid file type. Please select a CSV file.';
      setImportError(errorMsg);
      alert(errorMsg);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvContent = e.target?.result as string;
      if (!csvContent) {
        const errorMsg = 'Could not read file content.';
        setImportError(errorMsg);
        alert(errorMsg);
        return;
      }
      try {
        const importedLogs = await parseCsvToLogs(csvContent);
        if (importedLogs.length > 0) {
          setLogs(prevLogs => {
            const combinedLogs = [...prevLogs, ...importedLogs];
            return combinedLogs.sort((a, b) => {
              const dateA = new Date(`${a.date} ${a.timeOfDay}`);
              const dateB = new Date(`${b.date} ${b.timeOfDay}`);
              if (isNaN(dateA.getTime())) return 1;
              if (isNaN(dateB.getTime())) return -1;
              return dateB.getTime() - dateA.getTime();
            });
          });
          alert(`Successfully imported ${importedLogs.length} log entries.`);
        } else {
          alert('No new log entries were found in the selected file.');
        }
      } catch (error) {
        const message = (typeof error === 'object' && error !== null && 'message' in error) ? (error as any).message : 'An unknown error occurred during import.';
        setImportError(message);
        alert(`Import failed: ${message}`);
      }
    };
    reader.onerror = () => {
      const errorMsg = 'Failed to read the file.';
      setImportError(errorMsg);
      alert(errorMsg);
    };
    reader.readAsText(file);
  }, [setLogs]);

  const toggleManualForm = () => {
    setShowManualForm(prev => !prev);
  };

  const handleCancelManualForm = () => {
    setShowManualForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-black py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <header className="flex flex-col sm:flex-row items-center justify-center sm:justify-between mb-6 w-full max-w-4xl">
        <div className="flex items-center justify-center mb-4 sm:mb-0">
          <Droplet size={48} className="text-indigo-600 dark:text-indigo-400 mr-4" />
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-tight text-center sm:text-left">Flow Tracker</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1 text-center sm:text-left">Monitor Your Measurements</p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-150"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <button onClick={() => setShowMeasurementForm(!showMeasurementForm)} className="w-full flex justify-between items-center p-4 text-lg font-medium text-left text-gray-800 dark:text-gray-100 cursor-pointer transition hover:bg-gray-200 dark:hover:bg-gray-700">
            New Measurement
            {showMeasurementForm ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {showMeasurementForm && (
            <div className="p-4">
              {!showManualForm ? (
                <>
                  <MeasurementForm onSave={handleSaveLog} />
                  <button
                    onClick={toggleManualForm}
                    className="mt-4 flex items-center justify-center px-5 py-2.5 bg-purple-600 dark:bg-purple-700 text-white font-medium rounded-md shadow-sm hover:bg-purple-700 dark:hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out"
                  >
                    <PlusCircle size={20} className="mr-2" /> Add Manual Entry
                  </button>
                </>
              ) : (
                <ManualEntryForm onSave={handleSaveLog} onCancel={handleCancelManualForm} id="manual-entry-form" />
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <button onClick={() => setShowStats(!showStats)} className="w-full flex justify-between items-center p-4 text-lg font-medium text-left text-gray-800 dark:text-gray-100 cursor-pointer transition hover:bg-gray-200 dark:hover:bg-gray-700">
            Your Average Flow Rates
            {showStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {showStats && <div className="p-4"><StatsDisplay logs={logs} /></div>}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <button onClick={() => setShowAgeStats(!showAgeStats)} className="w-full flex justify-between items-center p-4 text-lg font-medium text-left text-gray-800 dark:text-gray-100 cursor-pointer transition hover:bg-gray-200 dark:hover:bg-gray-700">
            Reference Flow Rates by Age
            {showAgeStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {showAgeStats && (
            <div className="p-4 text-sm text-gray-800 dark:text-gray-100 space-y-6">
              <div>
                <h3 className="font-semibold text-base mb-1">Male</h3>
                <table className="w-full text-left border-collapse">
                  <thead><tr><th>Age Group</th><th className="px-4">Average Qmax (mL/sec)</th><th>Normal Range</th></tr></thead>
                  <tbody>
                    <tr><td>18–30</td><td className="px-4">21–25</td><td>15–30</td></tr>
                    <tr><td>31–40</td><td className="px-4">20–23</td><td>15–28</td></tr>
                    <tr><td>41–50</td><td className="px-4">18–21</td><td>12–25</td></tr>
                    <tr><td>51–60</td><td className="px-4">15–18</td><td>10–20</td></tr>
                    <tr><td>61–70</td><td className="px-4">12–15</td><td>8–18</td></tr>
                    <tr><td>71+</td><td className="px-4">10–13</td><td>7–15</td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Female</h3>
                <table className="w-full text-left border-collapse">
                  <thead><tr><th>Age Group</th><th className="px-4">Average Qmax (mL/sec)</th><th>Normal Range</th></tr></thead>
                  <tbody>
                    <tr><td>18–30</td><td className="px-4">25–30</td><td>20–35</td></tr>
                    <tr><td>31–40</td><td className="px-4">22–28</td><td>18–32</td></tr>
                    <tr><td>41–50</td><td className="px-4">20–25</td><td>15–30</td></tr>
                    <tr><td>51–60</td><td className="px-4">18–23</td><td>12–28</td></tr>
                    <tr><td>61–70</td><td className="px-4">15–20</td><td>10–25</td></tr>
                    <tr><td>71+</td><td className="px-4">13–18</td><td>8–22</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <button onClick={() => setShowLog(!showLog)} className="w-full flex justify-between items-center p-4 text-lg font-medium text-left text-gray-800 dark:text-gray-100 cursor-pointer transition hover:bg-gray-200 dark:hover:bg-gray-700">
            Measurement Log
            {showLog ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {showLog && (
            <div className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  accept=".csv"
                  style={{ display: 'none' }}
                  aria-hidden="true"
                />
                <button
                  onClick={triggerFileInput}
                  className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-green-500 dark:bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-600 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out"
                  aria-label="Import logs from CSV"
                >
                  <Upload size={20} className="mr-2" /> Import CSV
                </button>
                {logs.length > 0 && (
                  <button
                    onClick={handleExport}
                    className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-blue-500 dark:bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-150 ease-in-out"
                    aria-label="Export logs to CSV"
                  >
                    <Download size={20} className="mr-2" /> Export CSV
                  </button>
                )}
              </div>
              {importError && (
                <p className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/30 p-2 rounded border border-red-200 dark:border-red-800">
                  {importError}
                </p>
              )}
              <LogTable logs={logs} onDelete={handleDeleteLog} />
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <button onClick={() => setShowResources(!showResources)} className="w-full flex justify-between items-center p-4 text-lg font-medium text-left text-gray-800 dark:text-gray-100 cursor-pointer transition hover:bg-gray-200 dark:hover:bg-gray-700">
            Helpful Resources
            {showResources ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {showResources && (
            <div className="p-4 space-y-3 text-gray-800 dark:text-gray-100 text-sm">
              <p>• <a href="https://www.urologyhealth.org/urologic-conditions/urethral-stricture" className="underline text-blue-600 dark:text-blue-400" target="_blank">Urethral Stricture Overview - UrologyHealth.org</a></p>
              <p>• <a href="https://www.mayoclinic.org/diseases-conditions/enlarged-prostate/symptoms-causes/syc-20370087" className="underline text-blue-600 dark:text-blue-400" target="_blank">Prostate Enlargement - Mayo Clinic</a></p>
              <p>• <a href="https://www.uptodate.com/contents/search" className="underline text-blue-600 dark:text-blue-400" target="_blank">UpToDate: Medical References (Subscription)</a></p>
              <p>• <a href="https://www.niddk.nih.gov/health-information/urologic-diseases/urinary-retention" className="underline text-blue-600 dark:text-blue-400" target="_blank">Urinary Retention - NIDDK</a></p>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Flow Tracker. Track responsibly.</p>
      </footer>
    </div>
  );
}

export default App;
