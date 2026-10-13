export type Platform = 'whatsapp' | 'instagram' | 'tiktok' | 'facebook' | 'otra';

export type ViolenceKind =
  'riesgo' | 'ciberacoso' | 'sextorsion' | 'doxing' | 'suplantacion' | 'difusion' | 'grooming' | 'amenazas' | 'otro';

export type ReviewStatus = 'borrador' | 'revisado' | 'publicado';

// ── Ajustes ───────────────────────────────────────────────────────────────

export type AutoLock = 'immediate' | '1m' | '5m';
export type ThemePreference = 'system' | 'light' | 'dark';
export type TextScale = 1 | 1.15 | 1.3;

export interface Settings {
  onboarded: boolean;
  consentAt: string | null;
  disclaimerVersion: number;
  biometrics: boolean;
  autolock: AutoLock;
  hidePreview: boolean;
  theme: ThemePreference;
  textScale: TextScale;
  statsOptIn: boolean;
  notificationsDiscreet: boolean;
  selfCareReminders: boolean;
  /** Ya vio la explicación de la salida rápida (onboarding o aviso tras actualizar). */
  quickExitTipSeen: boolean;
}

// ── Círculo ───────────────────────────────────────────────────────────────

export type ContactRole = 'amiga' | 'familiar' | 'companera' | 'profesora' | 'pareja' | 'otra';

export interface CircleContact {
  id: string;
  name: string;
  phone: string;
  role?: ContactRole;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  body: string;
}

// ── Bitácora ──────────────────────────────────────────────────────────────

export interface EvidenceFile {
  id: string;
  incidentId: string;
  localUri: string;
  name: string;
  mime: string;
  sha256: string;
  size: number;
  addedAt: string;
}

export interface IncidentRevision {
  savedAt: string;
  description: string;
  notes?: string;
}

export interface Incident {
  id: string;
  occurredAt: string;
  platform: Platform;
  type?: ViolenceKind;
  title: string;
  description: string;
  involved?: string;
  links: string[];
  mood?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  locked?: boolean;
  /** Entrada automática cuando se usa la alerta rápida. */
  isAlertLog?: boolean;
  history: IncidentRevision[];
}

// ── Contenido ─────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  text: string;
  detail?: string;
}

export interface GuideSection {
  heading: string;
  intro?: string;
  items: ChecklistItem[];
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  icon: string;
  category: 'primeros-pasos' | 'plataforma' | 'rutas';
  platform?: Platform;
  sections: GuideSection[];
  tips?: string[];
  lastReviewed: string;
  reviewStatus: ReviewStatus;
}

export interface Article {
  slug: string;
  title: string;
  summary: string;
  icon: string;
  minutes: number;
  body: string[];
  keyPoints: string[];
  reviewStatus: ReviewStatus;
}

export type DirectoryType = 'emergencia' | 'policia' | 'mujeres' | 'psicologico' | 'juridico' | 'uvp' | 'plataformas';

export interface DirectoryEntry {
  id: string;
  name: string;
  type: DirectoryType;
  description: string;
  phone?: string;
  email?: string;
  url?: string;
  address?: string;
  hours?: string;
  whatToExpect: string;
  verified: boolean;
  verifiedAt?: string;
  source?: string;
  scope: 'uvp' | 'puebla' | 'nacional';
}

// ── Árbol de orientación ──────────────────────────────────────────────────

export interface TriageOption {
  label: string;
  /** Una línea que explica la opción (opcional). */
  hint?: string;
  next: string;
  set?: Record<string, string>;
}

export interface TriageQuestionNode {
  id: string;
  question: string;
  help?: string;
  options: TriageOption[];
}

export interface TriageResultNode {
  id: string;
  result: ViolenceKind;
}

export type TriageNode = TriageQuestionNode | TriageResultNode;

export interface TriageResult {
  kind: ViolenceKind;
  title: string;
  explanation: string;
  urgent: boolean;
  doNow: string[];
  dontDo: string[];
  guides: string[];
  /** 1 = te afecta · 2 = es violencia digital · 3 = puede ser delito. */
  level?: 1 | 2 | 3;
  /** Qué dice la ley, en lenguaje sencillo (información general, no asesoría). */
  law?: string;
}

export interface TriageExtra {
  when: Record<string, string>;
  text: string;
}

export interface TriageTree {
  version: number;
  reviewStatus: ReviewStatus;
  start: string;
  nodes: TriageNode[];
  results: Record<ViolenceKind, TriageResult>;
  extras: TriageExtra[];
}
