
import React, { useState, useEffect } from 'react';
import { UpdaterService } from '../services/updater';
import { UpdatePackage, UpdateLog } from '../types';
import { RefreshCw, DownloadCloud, History, CheckCircle, AlertTriangle, ShieldCheck, Clock, Zap, Monitor, Smartphone, Laptop } from 'lucide-react';
import { Button } from './Button';

export const UpdateManager: React.FC = () => {
    const [logs, setLogs] = useState<UpdateLog[]>([]);
    const [availableUpdate, setAvailableUpdate] = useState<UpdatePackage | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'downloading' | 'installing' | 'done'>('idle');
    const [currentVersion, setCurrentVersion] = useState(UpdaterService.getCurrentVersion());
    
    // Preferences
    const [autoUpdate, setAutoUpdate] = useState(UpdaterService.getAutoUpdate());
    const [betaChannel, setBetaChannel] = useState(false);

    useEffect(() => {
        setLogs(UpdaterService.getLogs());
        setAvailableUpdate(UpdaterService.getPendingUpdate());
        // Poll for version changes (simulating external update effect)
        const interval = setInterval(() => {
            setCurrentVersion(UpdaterService.getCurrentVersion());
            setAvailableUpdate(UpdaterService.getPendingUpdate());
            setLogs(UpdaterService.getLogs());
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const toggleAutoUpdate = () => {
        const newValue = !autoUpdate;
        setAutoUpdate(newValue);
        UpdaterService.setAutoUpdate(newValue);
    };

    const handleCheck = async () => {
        setIsChecking(true);
        const update = await UpdaterService.checkForUpdates(false);
        setAvailableUpdate(update);
        setIsChecking(false);
    };

    const handleUpdateFlow = async () => {
        if (!availableUpdate) return;
        
        setStatus('downloading');
        await UpdaterService.downloadUpdate(availableUpdate, (p) => setDownloadProgress(p));
        
        setStatus('installing');
        try {
            await UpdaterService.applyUpdate(availableUpdate);
            setStatus('done');
            setCurrentVersion(UpdaterService.getCurrentVersion());
            setLogs(UpdaterService.getLogs());
            setAvailableUpdate(null);
        } catch (e) {
            setStatus('idle');
            setLogs(UpdaterService.getLogs());
        }
    };

    const getPlatformIcon = (platform?: string) => {
        if (!platform) return <Monitor size={14} />;
        if (platform.includes('win') || platform.includes('darwin') || platform.includes('linux')) return <Laptop size={14} />;
        if (platform.includes('android') || platform.includes('ios')) return <Smartphone size={14} />;
        return <Monitor size={14} />;
    };

    return (
        <div className="space-y-6">
            {/* Version Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-parsam-900/50 rounded-xl flex items-center justify-center border border-parsam-500/20">
                        <ShieldCheck size={24} className="text-parsam-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Current Version</div>
                        <div className="text-2xl font-bold text-white font-mono">v{currentVersion}</div>
                    </div>
                </div>
                <Button 
                    onClick={handleCheck} 
                    disabled={isChecking || status !== 'idle'} 
                    loading={isChecking}
                    variant="secondary"
                    icon={<RefreshCw size={16} />}
                >
                    {isChecking ? 'Checking...' : 'Check for Updates'}
                </Button>
            </div>

            {/* Maintenance Settings */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${autoUpdate ? 'bg-green-900/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                            <Clock size={18} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-200">Auto-Maintenance</div>
                            <div className="text-[10px] text-slate-500">Install non-critical updates automatically</div>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={autoUpdate} onChange={toggleAutoUpdate} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-parsam-600"></div>
                    </label>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${betaChannel ? 'bg-purple-900/20 text-purple-400' : 'bg-slate-800 text-slate-500'}`}>
                            <Zap size={18} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-200">Beta Channel</div>
                            <div className="text-[10px] text-slate-500">Get experimental features early</div>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={betaChannel} onChange={() => setBetaChannel(!betaChannel)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>
            </div>

            {/* Active Update Card */}
            {availableUpdate && (
                <div className="bg-slate-900 border border-parsam-500/30 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-4">
                    <div className={`p-4 border-b border-parsam-500/20 flex justify-between items-center ${availableUpdate.severity === 'critical' ? 'bg-red-900/20' : 'bg-parsam-900/20'}`}>
                        <div className={`flex items-center gap-2 font-bold ${availableUpdate.severity === 'critical' ? 'text-red-400' : 'text-parsam-300'}`}>
                            <DownloadCloud size={18} />
                            {availableUpdate.severity === 'critical' ? 'CRITICAL SECURITY UPDATE' : `Update Available: v${availableUpdate.version}`}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] bg-black/30 px-2 py-1 rounded text-slate-300 font-mono border border-white/10 uppercase">
                                {getPlatformIcon(availableUpdate.platform)} {availableUpdate.platform}
                            </span>
                            {availableUpdate.severity === 'critical' && (
                                <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold uppercase animate-pulse">Action Required</span>
                            )}
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-slate-300 mb-2">What's New</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
                                {availableUpdate.changelog.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {status === 'idle' && (
                            <Button onClick={handleUpdateFlow} className={`w-full ${availableUpdate.severity === 'critical' ? 'bg-red-600 hover:bg-red-500' : ''}`}>
                                {availableUpdate.severity === 'critical' ? 'Install Security Patch Now' : `Download & Install (${(availableUpdate.sizeBytes / 1024 / 1024).toFixed(1)} MB)`}
                            </Button>
                        )}

                        {(status === 'downloading' || status === 'installing') && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>{status === 'downloading' ? 'Downloading Package...' : 'Verifying & Installing...'}</span>
                                    <span>{downloadProgress}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-300 ${availableUpdate.severity === 'critical' ? 'bg-red-500' : 'bg-parsam-500'}`}
                                        style={{ width: `${downloadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {status === 'done' && (
                            <div className="text-center text-green-400 py-2 font-medium flex items-center justify-center gap-2">
                                <CheckCircle size={18} /> Update Complete
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center gap-2 text-slate-300 font-bold text-sm">
                    <History size={16} /> Update History
                </div>
                <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
                    {logs.length === 0 && <div className="p-4 text-xs text-slate-500 text-center">No update logs found.</div>}
                    {logs.map(log => (
                        <div key={log.id} className="p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {log.status === 'success' ? <CheckCircle size={14} className="text-green-400" /> : 
                                     log.status === 'rollback' ? <RefreshCw size={14} className="text-orange-400" /> : 
                                     <AlertTriangle size={14} className="text-red-400" />}
                                    <span className="text-sm font-medium text-slate-200">
                                        v{log.versionFrom} <span className="text-slate-600">→</span> v{log.versionTo}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500">{log.details}</div>
                            </div>
                            <div className="text-xs text-slate-600 font-mono">
                                {new Date(log.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
