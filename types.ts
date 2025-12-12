
export type Language = 'en' | 'de' | 'fa';

export type Module = 'notes' | 'logos' | 'voice' | 'drive' | 'chat' | 'office' | 'system' | 'dev';

export interface SystemSpecs {
    browser: string;
    os: string;
    cores: number;
    memory: number; // GB approx
    online: boolean;
    webgl: boolean;
    audio: boolean;
}

export interface SetupStage {
    id: 'welcome' | 'system' | 'config' | 'modules' | 'tutorial' | 'complete';
    title: string;
}

export interface AutoTestResult {
    module: string;
    passed: boolean;
    message: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  isVerified: boolean;
  isActive: boolean;
  role: 'user' | 'admin';
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: number;
  updatedAt: number;
  langPref: Language;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  type: 'user' | 'smart' | 'system';
  parentId?: string;
  module?: 'notes' | 'drive';
}

export interface Attachment {
  id: string;
  userId: string;
  fileName: string;
  mimeType: string;
  size: number;
  objectStorePath: string;
  data: string;
  checksum: string;
  tags: string[];
  createdAt: number;
  extractedText?: string;
}

export interface NotePage {
  id: string;
  title: string;
  content: string; // HTML content
  order: number;
}

export interface Note {
  id: string;
  userId: string;
  folderId: string;
  title: string;
  contentRich: string; // Deprecated but kept for compatibility summary
  contentPlain: string; // Used for search indexing (concatenated pages)
  pages: NotePage[]; // New Multi-page support
  language: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  isEncrypted: boolean;
  attachments: Attachment[];
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  syncStatus: 'offline' | 'syncing' | 'synced';
}

export interface NoteVersion {
  id: string;
  noteId: string;
  versionNumber: number;
  contentSnapshot: string;
  createdAt: number;
  createdByDevice: string;
}

export interface DriveFile {
  id: string;
  userId: string;
  folderId: string;
  name: string;
  type: string;
  size: number;
  data: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  category: 'image' | 'document' | 'media' | 'archive' | 'financial' | 'work' | 'personal' | 'other';
  isEncrypted: boolean;
  isStarred: boolean;
  metadata?: {
      ocrText?: string;
      [key: string]: any;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface LogoProject {
  id: string;
  userId: string;
  brandName: string;
  slogan: string;
  industry: string;
  style: string;
  prompt: string;
  imageData: string;
  createdAt: number;
}

export interface ApiClient {
  id: string; 
  userId: string; 
  clientName: string;
  clientSecretHash: string;
  scopes: string[]; 
  rateLimit: number; 
  createdAt: number;
}

export interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'maintenance';
  uptime: number;
  latency: number;
  region: string;
}

export interface UserDevice {
  id: string;
  userId: string;
  deviceName: string;
  deviceFingerprint: string;
  lastSeen: number;
  authTokenHash: string;
  isTrusted: boolean;
}

export type DeviceSession = UserDevice;

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  timestamp: number;
  ip: string;
  device: string;
  location: string;
  status: 'success' | 'failed' | 'blocked' | '2fa_pending';
}

export interface VerificationToken {
  id: string;
  userId: string;
  token: string;
  type: 'email_activation' | 'password_reset';
  expiry: number;
  createdAt: number;
}

export interface CloudNode {
  id: string;
  name: string;
  type: 'balancer' | 'api' | 'db' | 'vector' | 'auth' | 'storage';
  region: string;
  status: 'healthy' | 'degraded' | 'down';
  metrics: {
      cpu: number;
      memory: number;
      latency: number;
      requests: number;
  };
  uptime: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: number;
  type: 'ddos' | 'auth_fail' | 'sql_injection' | 'bot_traffic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceIp: string;
  targetNode: string;
  actionTaken: 'blocked' | 'monitored' | 'mitigated';
}

export interface SystemLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'update';
  module: string;
  message: string;
}

export interface OptimizationReport {
  id: string;
  date: number;
  improvements: string[];
  codeChanges: string;
  dbOptimizations: string;
  securityPatches: string[];
  status: 'pending' | 'applied';
}

export interface UpdatePackage {
  id: string;
  version: string;
  releaseDate: number;
  changelog: string[];
  downloadUrl: string;
  hash: string;
  severity: 'feature' | 'critical' | 'maintenance';
  sizeBytes: number;
  platform: 'web' | 'win32' | 'darwin' | 'linux' | 'android' | 'ios';
}

export interface UpdateLog {
    id: string;
    deviceId: string;
    versionFrom: string;
    versionTo: string;
    status: 'success' | 'failed' | 'rollback';
    timestamp: number;
    details: string;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'update';
    timestamp: number;
    read: boolean;
    actionLabel?: string;
    actionFn?: () => void;
}

export type SyncEventType = 'NOTE_UPDATE' | 'SETTINGS_UPDATE' | 'UPDATE_AVAILABLE';

export interface SyncEvent {
    type: SyncEventType;
    entityId?: string;
    timestamp: number;
    sourceDeviceId: string;
}

export type ThemeIntensity = 'low' | 'medium' | 'high';
export type UIDensity = 'compact' | 'comfortable';

export interface UserSettings {
    userId: string;
    theme: string;
    notificationsEnabled: boolean;
    language?: Language;
    themeIntensity?: ThemeIntensity; // For blur/glass effects
    uiDensity?: UIDensity; // For spacing
}

export interface UserCloudUsage {
    userId: string;
    totalStorageBytes: number;
    usedStorageBytes: number;
    noteCount: number;
    fileCount: number;
    lastCalculated: number;
}

export interface AIInteraction {
    id: string;
    userId: string;
    prompt: string;
    response: string;
    timestamp: number;
}

export interface SmartFolder {
    id: string;
    userId: string;
    name: string;
    query: string;
}

export interface AdminAction {
    id: string;
    adminId: string;
    action: string;
    targetId: string;
    timestamp: number;
    AdminAction: any;
}

export interface SystemReport {
    id: string;
    timestamp: number;
    metrics: any;
}

export interface VectorEntry {
    id: string;
    userId: string;
    objectId: string;
    objectType: 'note' | 'file';
    vector: number[];
    textChunk: string;
    metadata: any;
}

// --- SELF HEALING TYPES ---
export interface HealthCheck {
  id: string;
  service: string; // 'Database', 'Auth', 'Sync', 'Storage', 'AI Worker'
  status: 'healthy' | 'degraded' | 'critical';
  details: string;
  lastChecked: number;
}

export interface HealingLog {
  id: string;
  timestamp: number;
  component: string;
  issueDetected: string;
  actionTaken: string;
  outcome: 'repaired' | 'failed' | 'manual_intervention_required';
}

export interface ModuleHealth {
    moduleId: Module;
    status: 'healthy' | 'error' | 'warning';
    issue?: string;
    fixAction?: string;
}

export enum AIServiceType {
    GENERATE_TITLE = 'GENERATE_TITLE',
    FIX_GRAMMAR = 'FIX_GRAMMAR',
    SUMMARIZE = 'SUMMARIZE',
    DETECT_TASKS = 'DETECT_TASKS'
}
