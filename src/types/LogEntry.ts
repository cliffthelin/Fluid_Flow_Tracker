export interface LogEntry {
  id: string;
  date: string; // Formatted date string e.g., "10/25/2023"
  timeOfDay: string; // Formatted time string e.g., "14:30:00"
  durationSeconds: number;
  volumeMl: number;
  rateMlPerSecond: number;
}
