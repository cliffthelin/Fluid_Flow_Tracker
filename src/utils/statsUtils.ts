import { LogEntry } from '../types/LogEntry';

    /**
     * Parses the date and time from a LogEntry into a Date object.
     * Handles potential parsing errors.
     */
    const parseLogDateTime = (log: LogEntry): Date | null => {
      try {
        // Attempt common formats or rely on Date constructor flexibility
        const dateTimeString = `${log.date} ${log.timeOfDay}`;
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) {
          // Try ISO-like format if previous failed (e.g., if date is YYYY-MM-DD)
          const isoAttempt = new Date(`${log.date}T${log.timeOfDay}`);
          if (isNaN(isoAttempt.getTime())) {
            console.warn(
              `Could not parse date/time for log ID ${log.id}: "${dateTimeString}"`,
            );
            return null;
          }
          return isoAttempt;
        }
        return date;
      } catch (e) {
        console.error(`Error parsing date/time for log ID ${log.id}:`, e);
        return null;
      }
    };

    /**
     * Filters logs within a specific time range relative to a reference date (defaulting to now).
     * @param logs Array of LogEntry objects.
     * @param hoursAgoStart Start of the period in hours ago (e.g., 24 for the last 24 hours).
     * @param hoursAgoEnd End of the period in hours ago (e.g., 0 for up to now).
     * @param referenceDate The date to calculate ranges from (defaults to current time).
     */
    const filterLogsByTimeRange = (
      logs: LogEntry[],
      hoursAgoStart: number,
      hoursAgoEnd: number,
      referenceDate: Date = new Date(),
    ): LogEntry[] => {
      const endTime = referenceDate.getTime() - hoursAgoEnd * 60 * 60 * 1000;
      const startTime = referenceDate.getTime() - hoursAgoStart * 60 * 60 * 1000;

      return logs.filter(log => {
        const logDate = parseLogDateTime(log);
        if (!logDate) return false;
        const logTime = logDate.getTime();
        return logTime >= startTime && logTime < endTime;
      });
    };

    /**
     * Calculates the average rate (ml/s) from a list of log entries.
     * Returns null if no logs or logs have zero total duration.
     */
    const calculateAverageRate = (logs: LogEntry[]): number | null => {
      if (logs.length === 0) return null;

      const totalVolume = logs.reduce((sum, log) => sum + log.volumeMl, 0);
      const totalDuration = logs.reduce((sum, log) => sum + log.durationSeconds, 0);

      // Avoid division by zero if total duration is 0
      if (totalDuration <= 0) return null;

      // Calculate average rate based on total volume and total duration for accuracy
      // return totalVolume / totalDuration;

      // Or calculate average of individual rates (less accurate if durations vary widely)
      const sumOfRates = logs.reduce((sum, log) => sum + log.rateMlPerSecond, 0);
      return sumOfRates / logs.length;
    };

    /**
     * Calculates the percentage change between two values.
     * Handles cases where the previous value is zero or null.
     */
    const calculatePercentageChange = (
      current: number | null,
      previous: number | null,
    ): number | null => {
      if (current === null || previous === null) return null; // Not enough data
      if (previous === 0) {
        // If previous is 0 and current is > 0, change is infinite (or undefined)
        // Represent as a large number or null/special string depending on desired display
        return current > 0 ? Infinity : 0; // Or return null;
      }
      return ((current - previous) / previous) * 100;
    };

    /**
     * Calculates daily, weekly, monthly, 60, 90, and 120 day average rates and their comparisons.
     */
    export const calculateRateStats = (logs: LogEntry[]) => {
      const now = new Date();

      // --- Daily ---
      const logsLast24h = filterLogsByTimeRange(logs, 24, 0, now);
      const logsPrev24h = filterLogsByTimeRange(logs, 48, 24, now);
      const avgRateLast24h = calculateAverageRate(logsLast24h);
      const avgRatePrev24h = calculateAverageRate(logsPrev24h);
      const dailyChange = calculatePercentageChange(avgRateLast24h, avgRatePrev24h);

      // --- Weekly ---
      const logsLast7d = filterLogsByTimeRange(logs, 7 * 24, 0, now);
      const logsPrev7d = filterLogsByTimeRange(logs, 14 * 24, 7 * 24, now);
      const avgRateLast7d = calculateAverageRate(logsLast7d);
      const avgRatePrev7d = calculateAverageRate(logsPrev7d);
      const weeklyChange = calculatePercentageChange(avgRateLast7d, avgRatePrev7d);

      // --- Monthly (approx 30 days) ---
      const logsLast30d = filterLogsByTimeRange(logs, 30 * 24, 0, now);
      const logsPrev30d = filterLogsByTimeRange(logs, 60 * 24, 30 * 24, now);
      const avgRateLast30d = calculateAverageRate(logsLast30d);
      const avgRatePrev30d = calculateAverageRate(logsPrev30d);
      const monthlyChange = calculatePercentageChange(avgRateLast30d, avgRatePrev30d);

      // --- 60 Days ---
      const logsLast60d = filterLogsByTimeRange(logs, 60 * 24, 0, now);
      const logsPrev60d = filterLogsByTimeRange(logs, 120 * 24, 60 * 24, now);
      const avgRateLast60d = calculateAverageRate(logsLast60d);
      const avgRatePrev60d = calculateAverageRate(logsPrev60d);
      const sixtyDayChange = calculatePercentageChange(avgRateLast60d, avgRatePrev60d);

      // --- 90 Days ---
      const logsLast90d = filterLogsByTimeRange(logs, 90 * 24, 0, now);
      const logsPrev90d = filterLogsByTimeRange(logs, 180 * 24, 90 * 24, now);
      const avgRateLast90d = calculateAverageRate(logsLast90d);
      const avgRatePrev90d = calculateAverageRate(logsPrev90d);
      const ninetyDayChange = calculatePercentageChange(avgRateLast90d, avgRatePrev90d);

      // --- 120 Days ---
      const logsLast120d = filterLogsByTimeRange(logs, 120 * 24, 0, now);
      const logsPrev120d = filterLogsByTimeRange(logs, 240 * 24, 120 * 24, now);
      const avgRateLast120d = calculateAverageRate(logsLast120d);
      const avgRatePrev120d = calculateAverageRate(logsPrev120d);
      const oneHundredTwentyDayChange = calculatePercentageChange(
        avgRateLast120d,
        avgRatePrev120d,
      );

      // --- Highest and Lowest ---
      const sortedLogs = [...logs].sort((a, b) => b.rateMlPerSecond - a.rateMlPerSecond);
      const highestRate = sortedLogs.length > 0 ? sortedLogs[0].rateMlPerSecond : null;
      const lowestRate = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].rateMlPerSecond : null;
      const latestRate = logs.length > 0 ? logs[0].rateMlPerSecond : null;
      const highestChange = calculatePercentageChange(latestRate, highestRate);
      const lowestChange = calculatePercentageChange(latestRate, lowestRate);

      return {
        daily: {
          current: avgRateLast24h,
          previous: avgRatePrev24h,
          change: dailyChange,
          count: logsLast24h.length,
        },
        weekly: {
          current: avgRateLast7d,
          previous: avgRatePrev7d,
          change: weeklyChange,
          count: logsLast7d.length,
        },
        monthly: {
          current: avgRateLast30d,
          previous: avgRatePrev30d,
          change: monthlyChange,
          count: logsLast30d.length,
        },
        sixtyDay: {
          current: avgRateLast60d,
          previous: avgRatePrev60d,
          change: sixtyDayChange,
          count: logsLast60d.length,
        },
        ninetyDay: {
          current: avgRateLast90d,
          previous: avgRatePrev90d,
          change: ninetyDayChange,
          count: logsLast90d.length,
        },
        oneHundredTwentyDay: {
          current: avgRateLast120d,
          previous: avgRatePrev120d,
          change: oneHundredTwentyDayChange,
          count: logsLast120d.length,
        },
        highest: {
          current: highestRate,
          change: highestChange,
        },
        lowest: {
          current: lowestRate,
          change: lowestChange,
        },
      };
    };
