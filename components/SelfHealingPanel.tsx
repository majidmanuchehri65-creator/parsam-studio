
import React, { useState, useEffect } from 'react';
import { SelfHealingService } from '../services/selfHealing';
import { HealthCheck, HealingLog } from '../types';
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, Cpu, ShieldCheck, Play, Terminal, BrainCircuit } from 'lucide-react';
import { Button } from './Button';

export const SelfHealingPanel: React.FC = () => {
    const [checks, setChecks] = useState<HealthCheck[]>([]);
    const [logs, setLogs] = useState<HealingLog[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [currentAction, setCurrentAction] = useState("");

    useEffect(() => {
        // Initial Scan
        runScan();
        // Periodic Scan (every 60s)
        const interval = setInterval(runScan, 60000);
        return () => clearInterval(interval);
    }, []);

    const runScan = async () => {
        if (isScanning) return;
        setIsScanning(true);
        setScanProgress(0);
        setCurrentAction("Initializing diagnostic subroutines...");

        // Visual simulation of steps
        const steps = [
            "Checking local storage integrity...",
            "Verifying CRDT sync state vectors...",
            "Pinging cloud microservices...",
            "Analyzing logs with Gemini AI..."
        ];

        let stepIndex = 0;
        const timer = setInterval(() => {
            setScanProgress(p => Math.min(p + 15, 90));
            if (stepIndex < steps.length) {
                setCurrentAction(steps[stepIndex]);
                stepIndex++;
            }
        }, 800);

        try {
            // Actual Logic
            await new Promise(resolve => setTimeout(resolve, 3500)); // Allow visuals to play out
            const result = await SelfHealingService.runDiagnostics();
            setChecks(result.checks);
            
            // Add new logs at top
            if (result.logs.length > 0) {
                setLogs(prev => [...result.logs, ...prev]);
            }
            
            setScanProgress(100);
            setCurrentAction("System check complete.");
        } catch (e) {
            setCurrentAction("Diagnostics failed.");
        } finally {
            clearInterval(timer);
            setTimeout(() => {
                setIsScanning(false);
                setCurrentAction("");
            }, 1000);
        }
    };

    const getStatusIcon = (status: HealthCheck['status']) => {
        switch (status) {
            case 'healthy': return <CheckCircle size={18} className="text-green-400" />;
            case 'degraded': return <AlertTriangle size={18} className="text-yellow-400" />;
            case 'critical': return <XCircle size={18} className="text-red-400" />;
        }
    };

    const getOutcomeColor = (outcome: HealingLog['outcome']) => {
        switch (outcome) {
            case 'repaired': return 'text-green-400';
            case 'failed': return 'text-red-400';
            default: return 'text-blue-400';
        }
    };

    // Custom Window Style Class based on user request:
    // border: 2px solid rgba(0, 123, 255, 0.3) -> border-2 border-blue-500/30
    // borderRadius: 6px -> rounded-md
    // boxShadow: 0 2px 8px rgba(0,0,0,0.1) -> shadow-[0_2px_8px_rgba(0,0,0,0.1)]
    const windowStyle = "border-2 border-blue-500/30 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-3 bg-slate-900/40 backdrop-blur-sm";

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-parsam-400" />
                        AI Self-Healing Engine
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Autonomous diagnostics and automated repair system.</p>
                </div>
                <Button onClick={runScan} disabled={isScanning} icon={isScanning ? <Activity className="animate-spin" size={16}/> : <Play size={16}/>}>
                    {isScanning ? 'Running Diagnostics...' : 'Force System Scan'}
                </Button>
            </div>

            {/* Scan Visualization - Styled as 'Window' */}
            <div className={`${windowStyle} relative overflow-hidden`}>
                <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-sm font-bold text-slate-300">System Integrity Status</span>
                    <span className="text-xs font-mono text-parsam-400 animate-pulse">{currentAction || (isScanning ? `SCANNING ${scanProgress}%` : 'IDLE - MONITORING')}</span>
                </div>
                
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6 mx-1 max-w-[99%]">
                    <div 
                        className={`h-full rounded-full transition-all duration-300 ${isScanning ? 'bg-parsam-500' : 'bg-green-500'}`} 
                        style={{ width: `${scanProgress}%` }}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {checks.map(check => (
                        <div key={check.id} className="bg-slate-950/60 border border-slate-700/50 p-3 rounded-md flex flex-col gap-2 relative transition-all hover:border-blue-500/30">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{check.service}</span>
                                {getStatusIcon(check.status)}
                            </div>
                            <span className="text-sm font-medium text-slate-200">{check.details}</span>
                            <div className="mt-auto pt-2 flex justify-between items-center">
                                <span className="text-[10px] text-slate-600">{new Date(check.lastChecked).toLocaleTimeString()}</span>
                                {check.service.includes("Auth") || check.service.includes("Postgres") ? (
                                    <span className="text-[9px] bg-blue-900/20 text-blue-400 px-1.5 rounded">Remote</span>
                                ) : (
                                    <span className="text-[9px] bg-slate-800 text-slate-500 px-1.5 rounded">Local</span>
                                )}
                            </div>
                            
                            {/* Scanning Effect Overlay */}
                            {isScanning && (
                                <div className="absolute inset-0 bg-parsam-500/5 animate-pulse rounded-md pointer-events-none" />
                            )}
                        </div>
                    ))}
                    {checks.length === 0 && !isScanning && (
                        <div className="col-span-3 text-center py-4 text-slate-500 text-sm">System initialized. Waiting for first report...</div>
                    )}
                </div>
            </div>

            {/* Repair Logs - Styled as 'Window' */}
            <div className={`flex-1 flex flex-col overflow-hidden font-mono ${windowStyle} bg-black/40`}>
                <div className="pb-3 border-b border-slate-800/50 flex items-center gap-2 mb-2">
                    <Terminal size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-300">Live Repair Log</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {logs.length === 0 ? (
                        <div className="text-center text-slate-600 text-xs py-8 opacity-50">No anomalies detected. System operating within normal parameters.</div>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="flex gap-3 text-xs animate-in slide-in-from-left-2 mb-4 border-b border-slate-800/30 pb-2 last:border-0">
                                <div className="text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-bold ${log.component.includes('AI') ? 'text-purple-400' : 'text-blue-400'}`}>[{log.component}]</span>
                                        <span className="text-red-400">{log.issueDetected}</span>
                                    </div>
                                    <div className="text-slate-300 pl-4 border-l-2 border-slate-700 flex flex-col gap-1">
                                        {log.actionTaken.includes("[AI FIX]") ? (
                                            <>
                                                <div className="flex items-center gap-1 text-parsam-400">
                                                    <BrainCircuit size={10} />
                                                    <span>AI Diagnosis Complete</span>
                                                </div>
                                                <span>{log.actionTaken.replace("[AI FIX]", "")}</span>
                                            </>
                                        ) : (
                                            <span>{log.actionTaken}</span>
                                        )}
                                    </div>
                                </div>
                                <div className={`font-bold uppercase self-start ${getOutcomeColor(log.outcome)}`}>
                                    [{log.outcome}]
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
