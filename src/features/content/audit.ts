export interface AuditLevel {
  min: number;
  title: string;
  body: string;
}

/** Resultado cualitativo (nunca un número alarmista): el nivel más alto alcanzado. */
export function auditLevel(levels: AuditLevel[], checked: number): AuditLevel {
  const sorted = [...levels].sort((a, b) => a.min - b.min);
  return sorted.filter((l) => checked >= l.min).pop() ?? sorted[0];
}
