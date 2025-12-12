
import { UpdatePackage, UpdateLog } from '../types';
import { DatabaseService } from './database';
import { NotificationService } from './notification';
import { SyncService } from './sync';
import { StorageService } from './storage';

const CURRENT_VERSION = '11.0.0';

class UpdaterServiceClass {
    private isChecking = false;
    private autoUpdateEnabled = true;
    private pendingUpdate: UpdatePackage | null = null;

    constructor() {
        // Load preference
        const stored = localStorage.getItem('parsam_auto_update');
        this.autoUpdateEnabled = stored ? JSON.parse(stored) : true;

        // Ensure version is set
        if (!localStorage.getItem('parsam_version')) {
            localStorage.setItem('parsam_version', CURRENT_VERSION);
        }

        // Start background polling cycle
        setInterval(() => this.backgroundCycle(), 60 * 1000); // Check every minute for demo
    }

    getCurrentVersion() {
        return localStorage.getItem('parsam_version') || CURRENT_VERSION;
    }

    getPendingUpdate() {
        return this.pendingUpdate;
    }

    setAutoUpdate(enabled: boolean) {
        this.autoUpdateEnabled = enabled;
        localStorage.setItem('parsam_auto_update', JSON.stringify(enabled));
    }

    getAutoUpdate(): boolean {
        return this.autoUpdateEnabled;
    }

    private getPlatform(): UpdatePackage['platform'] {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('win')) return 'win32';
        if (ua.includes('mac')) return 'darwin';
        if (ua.includes('android')) return 'android';
        if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
        return 'web';
    }

    // The main autonomous loop
    private async backgroundCycle() {
        // 1. Detection
        const update = await this.checkForUpdates(true); // Silent check
        if (!update) return;

        // If auto-update is OFF, stop here (user has been notified by checkForUpdates)
        if (!this.autoUpdateEnabled) return;

        // 2. Automatic Download
        console.log(`[Updater] Auto-downloading v${update.version}...`);
        await this.downloadUpdate(update, () => {}); // Background download

        // 3. Automatic Installation (if not critical)
        if (update.severity !== 'critical') {
             console.log(`[Updater] Auto-installing v${update.version}...`);
             try {
                 await this.applyUpdate(update);
             } catch (e) {
                 console.error("[Updater] Auto-install failed, rolled back.", e);
             }
        }
        // Critical updates wait for user confirmation via the UI modal (handled in App.tsx via Sync event)
    }

    async checkForUpdates(silent = true): Promise<UpdatePackage | null> {
        if (this.isChecking) return null;
        this.isChecking = true;

        try {
            // Simulate Network Delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Logic to determine if an update is "found" (Simulation)
            // In a real app, this fetches manifest.json from CDN
            const currentVer = this.getCurrentVersion();
            const shouldFindUpdate = Math.random() > 0.8 && currentVer === '11.0.0'; 
            
            if (shouldFindUpdate) {
                const newVersion = `11.1.${Math.floor(Math.random() * 9)}`;
                const isCritical = Math.random() > 0.8; 
                const platform = this.getPlatform();

                const update: UpdatePackage = {
                    id: crypto.randomUUID(),
                    version: newVersion,
                    releaseDate: Date.now(),
                    changelog: [
                        `Optimized for ${platform === 'darwin' ? 'macOS Metal' : platform === 'win32' ? 'Windows DirectX' : 'Web Assembly'}`,
                        'Improved Vector Search performance by 15%',
                        'New "Cyberpunk" theme for LogoMaker',
                        'Security patch: JWT rotation logic updated'
                    ],
                    downloadUrl: `https://cdn.parsamstudio.com/updates/${platform}/v${newVersion}.pak`,
                    hash: 'sha256-mock-hash-integrity-check',
                    severity: isCritical ? 'critical' : 'feature',
                    sizeBytes: 1024 * 1024 * 45, // 45MB
                    platform: platform
                };

                this.pendingUpdate = update;

                if (!silent) {
                    NotificationService.send({
                        title: isCritical ? 'CRITICAL UPDATE REQUIRED' : 'Update Available',
                        message: `ParSam Studio v${update.version} is ready.`,
                        type: isCritical ? 'error' : 'update',
                        channels: ['app', 'push']
                    });
                }
                
                // Notify UI components
                SyncService.broadcast('UPDATE_AVAILABLE');
                return update;
            }

            if (!silent) {
                NotificationService.send({ title: 'System Up-to-Date', message: `v${currentVer} is the latest version.`, type: 'success' });
            }
            return null;

        } finally {
            this.isChecking = false;
        }
    }

    async downloadUpdate(update: UpdatePackage, onProgress: (p: number) => void): Promise<void> {
        // Simulate Download chunks
        let progress = 0;
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 15) + 5;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    onProgress(100);
                    resolve();
                } else {
                    onProgress(progress);
                }
            }, 300);
        });
    }

    private verifyPackage(update: UpdatePackage): boolean {
        // Simulate checking SHA-256 hash or digital signature
        console.log(`[Updater] Verifying integrity for ${update.version}... Hash: ${update.hash}`);
        return update.hash && update.hash.length > 0;
    }

    async applyUpdate(update: UpdatePackage): Promise<void> {
        // 1. Create Snapshot for Rollback
        console.log("[Updater] Creating system snapshot...");
        const snapshotId = StorageService.createSystemSnapshot();

        try {
            // 2. Mock Installation Delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 3. Verify Integrity
            if (!this.verifyPackage(update)) {
                throw new Error("Package integrity check failed. Signature mismatch.");
            }

            // 4. Random Fail-Safe Check (Chaos Monkey)
            const isCorrupt = Math.random() > 0.95; 
            if (isCorrupt) throw new Error("Installation corrupted files. Aborting.");

            // 5. Apply Changes (Update Version Pointer)
            localStorage.setItem('parsam_version', update.version);
            this.pendingUpdate = null; // Clear pending
            
            // 6. Success Notification
            NotificationService.send({
                title: 'Update Installed',
                message: `Successfully updated to v${update.version}`,
                type: 'success',
                channels: ['app', 'push']
            });

            // 7. Log Success
            const log: UpdateLog = {
                id: crypto.randomUUID(),
                deviceId: 'local',
                versionFrom: snapshotId, // using snapshot ID as reference to previous state
                versionTo: update.version,
                status: 'success',
                timestamp: Date.now(),
                details: `Auto-update applied successfully.`
            };
            this.saveLog(log);

            DatabaseService.Logs.add({
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                level: 'update',
                module: 'UPDATER',
                message: `System updated to ${update.version}`
            });

        } catch (e: any) {
            // 8. Rollback Procedure
            console.error(`[Updater] Error: ${e.message}. Rolling back...`);
            StorageService.restoreSystemSnapshot(snapshotId);
            await this.handleRollback(update, e.message);
            throw e;
        }
    }

    private async handleRollback(failedUpdate: UpdatePackage, reason: string) {
        const log: UpdateLog = {
            id: crypto.randomUUID(),
            deviceId: 'local',
            versionFrom: failedUpdate.version, // attempt
            versionTo: this.getCurrentVersion(), // rollback target
            status: 'rollback',
            timestamp: Date.now(),
            details: `Update failed: ${reason}. Restored previous snapshot.`
        };
        this.saveLog(log);
        this.pendingUpdate = null; 

        NotificationService.send({
            title: 'Update Rolled Back',
            message: 'System restored to safe state following update error.',
            type: 'warning',
            channels: ['app']
        });

        DatabaseService.Logs.add({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            level: 'error',
            module: 'UPDATER',
            message: `Rollback triggered for v${failedUpdate.version}`
        });
    }

    getLogs(): UpdateLog[] {
        const stored = localStorage.getItem('parsam_update_logs');
        return stored ? JSON.parse(stored) : [];
    }

    private saveLog(log: UpdateLog) {
        const logs = this.getLogs();
        localStorage.setItem('parsam_update_logs', JSON.stringify([log, ...logs]));
    }
}

export const UpdaterService = new UpdaterServiceClass();
