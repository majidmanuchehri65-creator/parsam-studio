
import { DatabaseService } from "./database";
import { User, Note, Folder, DriveFile, NoteVersion, ChatSession, UserSettings, DeviceSession, ApiClient, Attachment } from "../types";
import { SecurityService } from "./security";

const CURRENT_USER_KEY = 'parsam_current_user';
const SETUP_COMPLETE_KEY = 'parsam_setup_complete';

export class StorageService {
    
    // --- SETUP & INSTALLATION STATE ---
    static isSetupComplete(): boolean {
        return localStorage.getItem(SETUP_COMPLETE_KEY) === 'true';
    }

    static completeSetup() {
        localStorage.setItem(SETUP_COMPLETE_KEY, 'true');
    }

    // --- SNAPSHOTS (FOR UPDATES/ROLLBACK) ---
    static createSystemSnapshot(): string {
        const snapshot = {
            timestamp: Date.now(),
            settings: this.getSettings(),
            version: localStorage.getItem('parsam_version') || '11.0.0'
        };
        const id = `snapshot_${Date.now()}`;
        localStorage.setItem(id, JSON.stringify(snapshot));
        return id;
    }

    static restoreSystemSnapshot(snapshotId: string) {
        const data = localStorage.getItem(snapshotId);
        if(data) {
            const snapshot = JSON.parse(data);
            if(snapshot.settings) this.saveSettings(snapshot.settings);
            if(snapshot.version) localStorage.setItem('parsam_version', snapshot.version);
            console.log(`[System] Rolled back to snapshot ${snapshotId}`);
        }
    }

    // --- USER MANAGEMENT ---
    
    static getCurrentUser(): User | null {
        const stored = localStorage.getItem(CURRENT_USER_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    static getUserId(): string {
        return this.getCurrentUser()?.id || 'guest';
    }

    static login(email: string, pass: string): { status: 'success' | 'failed' | '2fa_required', user?: User } {
        const user = DatabaseService.Users.find(email);
        // Simple mock check - in real app use hash comparison
        if (user && user.passwordHash) {
             // Mock password check
             if(user.twoFactorEnabled) return { status: '2fa_required' };
             
             localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
             this.recordSession(user.id);
             return { status: 'success', user };
        }
        throw new Error("Invalid credentials");
    }

    static register(fullName: string, email: string, pass: string, lang: 'en' | 'de' | 'fa') {
        if(DatabaseService.Users.find(email)) throw new Error("Email already exists");
        
        const newUser: User = {
            id: crypto.randomUUID(),
            email,
            fullName,
            passwordHash: 'hashed_mock', // SecurityService.hashPasswordArgon2id(pass)
            isVerified: false,
            isActive: true,
            role: 'user',
            twoFactorEnabled: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            langPref: lang
        };
        DatabaseService.Users.create(newUser);
        // Create root folders
        this.createFolder('Work', 'notes', 'root');
        this.createFolder('Personal', 'notes', 'root');
    }

    static logout() {
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    static dev_seedUser(data: Partial<User>): User {
        const u = DatabaseService.Users.find(data.email || '');
        if (u) return u;
        
        const newUser: User = {
            id: crypto.randomUUID(),
            email: data.email || 'user@example.com',
            fullName: data.fullName || 'Dev User',
            passwordHash: 'mock',
            isVerified: true,
            isActive: true,
            role: 'admin',
            twoFactorEnabled: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            langPref: data.langPref || 'en'
        };
        DatabaseService.Users.create(newUser);
        
        // Seed default folders
        const uid = newUser.id;
        const rootFolders = [
            { id: crypto.randomUUID(), userId: uid, name: 'Work', type: 'user', module: 'notes', parentId: 'root' },
            { id: crypto.randomUUID(), userId: uid, name: 'Personal', type: 'user', module: 'notes', parentId: 'root' },
            { id: crypto.randomUUID(), userId: uid, name: 'Ideas', type: 'user', module: 'notes', parentId: 'root' },
            { id: crypto.randomUUID(), userId: uid, name: 'Documents', type: 'user', module: 'drive', parentId: 'root' }
        ];
        rootFolders.forEach(f => DatabaseService.Folders.create(f as Folder));

        return newUser;
    }

    // --- NOTES ---

    static getNotes(): Note[] {
        return DatabaseService.Notes.all().filter(n => n.userId === this.getUserId());
    }

    static createNote(folderId: string = 'root'): Note {
        const newNote: Note = {
            id: crypto.randomUUID(),
            userId: this.getUserId(),
            folderId,
            title: '',
            contentPlain: '',
            contentRich: '',
            pages: [],
            language: 'en',
            tags: [],
            isFavorite: false,
            isArchived: false,
            isEncrypted: false,
            attachments: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            deletedAt: null,
            syncStatus: 'synced'
        };
        DatabaseService.Notes.create(newNote);
        return newNote;
    }

    static updateNote(id: string, updates: Partial<Note>): Note {
        const current = DatabaseService.Notes.get(id);
        if (!current) throw new Error("Note not found");
        
        const updated = { ...current, ...updates, updatedAt: Date.now() };
        DatabaseService.Notes.update(id, updated);
        
        // Versioning Logic (Mock)
        if (updates.contentPlain || updates.contentRich || updates.pages) {
            this.saveNoteVersion(updated);
        }

        return updated;
    }

    static softDeleteNote(id: string) {
        this.updateNote(id, { deletedAt: Date.now() });
    }

    static permanentDeleteNote(id: string) {
        DatabaseService.Notes.delete(id);
    }

    // --- FOLDERS ---

    static getFolders(): Folder[] {
        return DatabaseService.Folders.findByUser(this.getUserId());
    }

    static createFolder(name: string, module: 'notes' | 'drive' = 'notes', parentId: string = 'root'): Folder {
        const f: Folder = {
            id: crypto.randomUUID(),
            userId: this.getUserId(),
            name,
            type: 'user',
            module,
            parentId
        };
        DatabaseService.Folders.create(f);
        return f;
    }

    static updateFolder(id: string, updates: Partial<Folder>) {
        DatabaseService.Folders.update(id, updates);
    }
  
    static deleteFolder(id: string) { 
        // Recursive Delete Logic
        const allFolders = DatabaseService.Folders.all();
        const toDeleteIds = new Set<string>([id]);

        // Find children recursively
        const findChildren = (pid: string) => {
            const children = allFolders.filter(f => f.parentId === pid);
            children.forEach(c => {
                toDeleteIds.add(c.id);
                findChildren(c.id);
            });
        };
        findChildren(id);

        // Delete folders
        toDeleteIds.forEach(fid => DatabaseService.Folders.delete(fid));

        // Delete associated files
        const allFiles = DatabaseService.getTable<DriveFile>(DatabaseService.KEYS.FILES);
        const keepFiles = allFiles.filter(f => !toDeleteIds.has(f.folderId));
        DatabaseService.saveTable(DatabaseService.KEYS.FILES, keepFiles);
    }

    // --- DRIVE FILES ---
    
    static getDriveFiles(): DriveFile[] {
        const files = DatabaseService.getTable<DriveFile>(DatabaseService.KEYS.FILES);
        return files.filter(f => f.userId === this.getUserId());
    }

    static getDriveFolders(): Folder[] {
        return this.getFolders().filter(f => f.module === 'drive');
    }

    static async uploadFile(file: File, folderId: string, onProgress: (p: number) => void): Promise<DriveFile> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                const newFile: DriveFile = {
                    id: crypto.randomUUID(),
                    userId: this.getUserId(),
                    folderId,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: dataUrl,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    tags: [],
                    category: 'other', 
                    isEncrypted: false,
                    isStarred: false
                };
                DatabaseService.insert(DatabaseService.KEYS.FILES, newFile);
                onProgress(100);
                resolve(newFile);
            };
            reader.readAsDataURL(file);
            // Simulate progress
            let p = 0;
            const interval = setInterval(() => {
                p += 10;
                if(p < 90) onProgress(p);
                else clearInterval(interval);
            }, 50);
        });
    }

    static saveDriveFile(file: DriveFile) {
        DatabaseService.update(DatabaseService.KEYS.FILES, file.id, file);
    }

    static deleteDriveFile(id: string) {
        const files = DatabaseService.getTable<DriveFile>(DatabaseService.KEYS.FILES).filter(f => f.id !== id);
        DatabaseService.saveTable(DatabaseService.KEYS.FILES, files);
    }

    // --- VERSIONS & HISTORY ---

    static getNoteVersions(noteId: string): NoteVersion[] {
        const all = DatabaseService.getTable<NoteVersion>(DatabaseService.KEYS.VERSIONS);
        return all.filter(v => v.noteId === noteId).sort((a, b) => b.createdAt - a.createdAt);
    }

    static saveNoteVersion(note: Note) {
        const versions = this.getNoteVersions(note.id);
        const newVersion: NoteVersion = {
            id: crypto.randomUUID(),
            noteId: note.id,
            versionNumber: versions.length + 1,
            contentSnapshot: note.contentRich || note.contentPlain,
            createdAt: Date.now(),
            createdByDevice: 'Current Browser'
        };
        DatabaseService.insert(DatabaseService.KEYS.VERSIONS, newVersion);
    }

    static restoreVersion(noteId: string, versionId: string) {
        const version = DatabaseService.getTable<NoteVersion>(DatabaseService.KEYS.VERSIONS).find(v => v.id === versionId);
        if(version) {
            this.updateNote(noteId, { contentRich: version.contentSnapshot, contentPlain: version.contentSnapshot.replace(/<[^>]*>?/gm, '') });
        }
    }

    // --- CHAT & SESSIONS ---

    static getChatSessions(): ChatSession[] {
        return DatabaseService.getTable<ChatSession>(DatabaseService.KEYS.CHATS).filter(c => c.userId === this.getUserId());
    }

    static createChatSession(): ChatSession {
        const s: ChatSession = {
            id: crypto.randomUUID(),
            userId: this.getUserId(),
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        DatabaseService.insert(DatabaseService.KEYS.CHATS, s);
        return s;
    }

    static saveChatSession(session: ChatSession) {
        DatabaseService.update(DatabaseService.KEYS.CHATS, session.id, session);
    }

    static deleteChatSession(id: string) {
        const chats = DatabaseService.getTable<ChatSession>(DatabaseService.KEYS.CHATS).filter(c => c.id !== id);
        DatabaseService.saveTable(DatabaseService.KEYS.CHATS, chats);
    }

    // --- SETTINGS & SESSIONS ---

    static getSettings(): UserSettings {
        const s = DatabaseService.getTable<UserSettings>(DatabaseService.KEYS.SETTINGS).find(s => s.userId === this.getUserId());
        return s || { 
            userId: this.getUserId(), 
            theme: 'dark', 
            notificationsEnabled: true,
            themeIntensity: 'medium',
            uiDensity: 'comfortable'
        };
    }

    static saveSettings(updates: Partial<UserSettings>) {
        let all = DatabaseService.getTable<UserSettings>(DatabaseService.KEYS.SETTINGS);
        let current = all.find(s => s.userId === this.getUserId());
        if(current) {
            Object.assign(current, updates);
        } else {
            current = { 
                userId: this.getUserId(), 
                theme: 'dark', 
                notificationsEnabled: true, 
                themeIntensity: 'medium', 
                uiDensity: 'comfortable',
                ...updates 
            };
            all.push(current);
        }
        DatabaseService.saveTable(DatabaseService.KEYS.SETTINGS, all);
    }

    static getUserSessions(): DeviceSession[] {
        return DatabaseService.getTable<DeviceSession>(DatabaseService.KEYS.SESSIONS).filter(s => s.userId === this.getUserId());
    }

    static recordSession(userId: string) {
        const sessions = DatabaseService.getTable<DeviceSession>(DatabaseService.KEYS.SESSIONS);
        // Clean old session for this device/mock
        const currentId = sessionStorage.getItem('device_id') || crypto.randomUUID();
        sessionStorage.setItem('device_id', currentId);
        
        const existing = sessions.find(s => s.id === currentId);
        if(existing) {
            existing.lastSeen = Date.now();
        } else {
            sessions.push({
                id: currentId,
                userId,
                deviceName: navigator.platform,
                deviceFingerprint: SecurityService.generateFingerprint(),
                lastSeen: Date.now(),
                authTokenHash: 'mock',
                isTrusted: true
            });
        }
        DatabaseService.saveTable(DatabaseService.KEYS.SESSIONS, sessions);
    }

    static isCurrentSession(id: string): boolean {
        return id === sessionStorage.getItem('device_id');
    }

    static revokeSession(id: string) {
        const list = DatabaseService.getTable<DeviceSession>(DatabaseService.KEYS.SESSIONS).filter(s => s.id !== id);
        DatabaseService.saveTable(DatabaseService.KEYS.SESSIONS, list);
    }

    // --- API CLIENTS ---
    static getApiClients(): ApiClient[] {
        return DatabaseService.getTable<ApiClient>(DatabaseService.KEYS.API_CLIENTS).filter(c => c.userId === this.getUserId());
    }

    static createApiClient(name: string): { client: ApiClient, rawSecret: string } {
        const secret = SecurityService.generateToken(32);
        const client: ApiClient = {
            id: 'pk_' + SecurityService.generateToken(16),
            userId: this.getUserId(),
            clientName: name,
            clientSecretHash: secret, 
            scopes: ['read', 'write'],
            rateLimit: 1000,
            createdAt: Date.now()
        };
        DatabaseService.insert(DatabaseService.KEYS.API_CLIENTS, client);
        return { client, rawSecret: secret };
    }

    static revokeApiClient(id: string) {
        const list = DatabaseService.getTable<ApiClient>(DatabaseService.KEYS.API_CLIENTS).filter(c => c.id !== id);
        DatabaseService.saveTable(DatabaseService.KEYS.API_CLIENTS, list);
    }

    // --- MISC ---
    static checkRateLimit(): boolean {
        return true;
    }

    static exportBackup() {
        const data = {
            user: this.getCurrentUser(),
            notes: this.getNotes(),
            folders: this.getFolders(),
            files: this.getDriveFiles()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'parsam_backup.json';
        a.click();
    }

    static async importData(jsonString: string): Promise<string> {
        try {
            const data = JSON.parse(jsonString);
            if(data.notes) data.notes.forEach((n: Note) => DatabaseService.Notes.create(n));
            if(data.folders) data.folders.forEach((f: Folder) => DatabaseService.Folders.create(f));
            return "Import successful";
        } catch(e) {
            throw new Error("Invalid backup file");
        }
    }

    static verify2FA(email: string, code: string): User {
        const u = DatabaseService.Users.find(email);
        if(u && code === '123456') { // Mock Code
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
            this.recordSession(u.id);
            return u;
        }
        throw new Error("Invalid 2FA Code");
    }

    static requestPasswordReset(email: string) {
        console.log("Password reset requested for " + email);
    }

    static resetPassword(token: string, newPass: string) {
        // Mock
    }

    static verifyAccount(token: string) {
        // Mock
    }
}
