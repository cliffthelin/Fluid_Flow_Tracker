import React from 'react';
    import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
    import { LogEntry } from '../types/LogEntry';
    import { calculateRateStats } from '../utils/statsUtils';

    interface StatsDisplayProps {
      logs: LogEntry[];
    }

    const formatRate = (rate: number | null): string => {
      if (rate === null || rate === undefined) return 'N/A';
      return rate.toFixed(2);
    };

    const formatChange = (change: number | null): React.ReactNode => {
      if (change === null || change === undefined) return <span className="text-gray-500 dark:text-gray-400 text-xs"> (vs N/A)</span>;
      if (!isFinite(change)) return <span className="text-green-600 dark:text-green-400 text-xs"> (vs 0)</span>; // Handle infinite change

      const absChange = Math.abs(change);
      const formattedChange = absChange.toFixed(1);

      if (change > 0.1) {
        return (
          <span className="text-green-600 dark:text-green-400 text-xs ml-1 inline-flex items-center">
            <TrendingUp size={12} className="mr-0.5" /> {formattedChange}%
          </span>
        );
      } else if (change < -0.1) {
        return (
          <span className="text-red-600 dark:text-red-400 text-xs ml-1 inline-flex items-center">
            <TrendingDown size={12} className="mr-0.5" /> {formattedChange}%
          </span>
        );
      } else {
        return (
          <span className="text-gray-500 dark:text-gray-400 text-xs ml-1 inline-flex items-center">
            <Minus size={12} className="mr-0.5" /> {formattedChange}%
          </span>
        );
      }
    };

    const StatsDisplay: React.FC<StatsDisplayProps> = ({ logs }) => {
      const stats = calculateRateStats(logs);

      const renderStatCard = (
        title: string,
        currentRate: number | null,
        change: number | null,
        count: number,
      ) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex-1 min-w-[150px] transition-colors duration-300">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {formatRate(currentRate)}
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">ml/s</span>
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-between">
            <span>{formatChange(change)}</span>
            <span className="text-right">{count} entries</span>
          </div>
        </div>
      );

      const renderHighestLowestCard = (
        title: string,
        currentRate: number | null,
        change: number | null,
      ) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex-1 min-w-[150px] transition-colors duration-300">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {formatRate(currentRate)}
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">ml/s</span>
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-between">
            <span>{formatChange(change)}</span>
          </div>
        </div>
      );

      // Only render if there are logs to calculate from
      if (logs.length === 0) {
        return (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full text-center">
            <p className="text-gray-500 dark:text-gray-400">Log some measurements to see your stats here.</p>
          </div>
        );
      }

      return (
        <div className="w-full">
          {/* Removed the inner h2 heading */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-4">
            {renderStatCard('Last 24 Hours', stats.daily.current, stats.daily.change, stats.daily.count)}
            {renderStatCard('Last 7 Days', stats.weekly.current, stats.weekly.change, stats.weekly.count)}
            {renderStatCard('Last 30 Days', stats.monthly.current, stats.monthly.change, stats.monthly.count)}
            {renderStatCard('Last 60 Days', stats.sixtyDay.current, stats.sixtyDay.change, stats.sixtyDay.count)}
            {renderStatCard('Last 90 Days', stats.ninetyDay.current, stats.ninetyDay.change, stats.ninetyDay.count)}
            {renderStatCard('Last 120 Days', stats.oneHundredTwentyDay.current, stats.oneHundredTwentyDay.change, stats.oneHundredTwentyDay.count)}
            {renderHighestLowestCard('Highest', stats.highest.current, stats.highest.change)}
            {renderHighestLowestCard('Lowest', stats.lowest.current, stats.lowest.change)}
          </div>
        </div>
      );
    };

    export default StatsDisplay;
