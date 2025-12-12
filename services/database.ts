
import { Note, Folder, User, SystemLog, ChatSession, DriveFile, NoteVersion, ApiClient, DeviceSession, VectorEntry, UserSettings } from "../types";

const KEYS = {
    USERS: 'ps_db_users',
    NOTES: 'ps_db_notes',
    FOLDERS: 'ps_db_folders',
    SETTINGS: 'ps_db_settings',
    FILES: 'ps_db_files',
    CHATS: 'ps_db_chats',
    LOGS: 'ps_db_system_logs',
    VERSIONS: 'ps_db_note_versions',
    SESSIONS: 'ps_db_sessions',
    API_CLIENTS: 'ps_db_api_clients',
    VECTORS: 'ps_db_vectors'
};

export class DatabaseService {
    
    // --- GENERIC HELPERS ---
    static getTable<T>(key: string): T[] {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : [];
        } catch {
            return [];
        }
    }

    static saveTable<T>(key: string, data: T[]) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static insert<T>(key: string, item: T) {
        const list = this.getTable<T>(key);
        list.unshift(item);
        this.saveTable(key, list);
    }

    static update<T extends { id: string }>(key: string, id: string, updates: Partial<T>) {
        const list = this.getTable<T>(key);
        const index = list.findIndex(i => i.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updates };
            this.saveTable(key, list);
        }
    }

    // --- ENTITY WRAPPERS ---

    static get Users() {
        return {
            all: () => this.getTable<User>(KEYS.USERS),
            find: (email: string) => this.getTable<User>(KEYS.USERS).find(u => u.email === email),
            create: (u: User) => this.insert(KEYS.USERS, u),
            update: (id: string, u: Partial<User>) => this.update(KEYS.USERS, id, u)
        };
    }

    static get Notes() {
        return {
            all: () => this.getTable<Note>(KEYS.NOTES),
            get: (id: string) => this.getTable<Note>(KEYS.NOTES).find(n => n.id === id),
            create: (n: Note) => this.insert(KEYS.NOTES, n),
            update: (id: string, u: Partial<Note>) => this.update(KEYS.NOTES, id, u),
            delete: (id: string) => {
                const list = this.getTable<Note>(KEYS.NOTES).filter(n => n.id !== id);
                this.saveTable(KEYS.NOTES, list);
            }
        };
    }

    static get Folders() {
        return {
            all: () => this.getTable<Folder>(KEYS.FOLDERS),
            findByUser: (userId: string) => this.getTable<Folder>(KEYS.FOLDERS).filter(f => f.userId === userId),
            create: (f: Folder) => this.insert(KEYS.FOLDERS, f),
            update: (id: string, u: Partial<Folder>) => this.update(KEYS.FOLDERS, id, u),
            delete: (id: string) => {
                const list = this.getTable<Folder>(KEYS.FOLDERS).filter(f => f.id !== id);
                this.saveTable(KEYS.FOLDERS, list);
            }
        };
    }

    static get Logs() {
        return {
            all: () => this.getTable<SystemLog>(KEYS.LOGS),
            recent: (count: number) => this.getTable<SystemLog>(KEYS.LOGS).slice(0, count),
            add: (log: SystemLog) => this.insert(KEYS.LOGS, log)
        };
    }

    static get VectorDB() {
        return {
            count: () => this.getTable<VectorEntry>(KEYS.VECTORS).length,
            upsertNote: (note: Note) => {
                // Mock implementation of vector upsert
                const vectors = this.getTable<VectorEntry>(KEYS.VECTORS);
                const filtered = vectors.filter(v => v.objectId !== note.id);
                filtered.push({
                    id: crypto.randomUUID(),
                    userId: note.userId,
                    objectId: note.id,
                    objectType: 'note',
                    vector: [], // Mock vector
                    textChunk: note.contentPlain.substring(0, 100),
                    metadata: {}
                });
                this.saveTable(KEYS.VECTORS, filtered);
            }
        };
    }

    // Expose keys for other services if needed
    static get KEYS() { return KEYS; }
}
