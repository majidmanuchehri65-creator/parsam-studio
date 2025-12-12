
import { SyncEvent, SyncEventType } from '../types';

const CHANNEL_NAME = 'parsam_sync_v1';

// Simulated CRDT Structures
interface CRDTStateVector {
    [deviceId: string]: number; // clock
}

interface CRDTUpdate {
    deviceId: string;
    clock: number;
    data: any;
    timestamp: number;
}

class SyncServiceClass {
    private channel: BroadcastChannel;
    private listeners: ((event: SyncEvent) => void)[] = [];
    private deviceId: string;
    
    // CRDT State
    private vectorClock: CRDTStateVector = {};
    private pendingUpdates: CRDTUpdate[] = [];

    constructor() {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.deviceId = crypto.randomUUID();
        this.vectorClock[this.deviceId] = 0;

        this.channel.onmessage = (msg) => {
            const event = msg.data as SyncEvent;
            // Ignore events from self
            if (event.sourceDeviceId !== this.deviceId) {
                // Simulate CRDT Merge
                this.mergeUpdate(event);
                this.notifyListeners(event);
            }
        };
    }

    public subscribe(callback: (event: SyncEvent) => void) {
        this.listeners.push(callback);
    }

    public unsubscribe(callback: (event: SyncEvent) => void) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    public broadcast(type: SyncEventType, entityId?: string) {
        // Increment local clock
        this.vectorClock[this.deviceId]++;
        
        const event: SyncEvent = {
            type,
            entityId,
            timestamp: Date.now(),
            sourceDeviceId: this.deviceId
        };
        
        // In a real app, we would include the binary CRDT delta here
        // this.channel.postMessage({ ...event, delta: Y.encodeStateAsUpdate(doc) });
        
        this.channel.postMessage(event);
    }

    // --- CRDT LOGIC SIMULATION ---

    private mergeUpdate(event: SyncEvent) {
        // Simple Last-Write-Wins (LWW) for this demo, 
        // but structured to mimic Vector Clock checks.
        
        const remoteId = event.sourceDeviceId;
        // In real CRDT, we check if we are missing updates from this peer
        
        console.log(`[SyncEngine] Merging update from ${remoteId}. Event: ${event.type}`);
        
        // Conflict Resolution Strategy:
        // 1. If timestamps are equal, sort by Device ID
        // 2. Otherwise, highest timestamp wins (LWW)
        
        // Simulate "Applying" the update to local state
        // DatabaseService.applyDelta(event.entityId, event.delta);
    }

    public getSyncStatus(): 'synced' | 'syncing' | 'offline' {
        if (!navigator.onLine) return 'offline';
        if (this.pendingUpdates.length > 0) return 'syncing';
        return 'synced';
    }

    private notifyListeners(event: SyncEvent) {
        this.listeners.forEach(cb => cb(event));
    }
}

export const SyncService = new SyncServiceClass();
