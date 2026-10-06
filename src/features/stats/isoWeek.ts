import { getISOWeek, getISOWeekYear } from 'date-fns';

/** "2026-W41": semana ISO, nunca la fecha exacta. */
export function isoWeek(date: Date = new Date()): string {
  return `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, '0')}`;
}
