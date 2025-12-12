
import { ServiceStatus, OptimizationReport, SystemLog, Module, ModuleHealth } from "../types";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

const MOCK_SERVICES: ServiceStatus[] = [
    { name: 'Auth Gateway', status: 'operational', uptime: 99.99, latency: 45, region: 'Global' },
    { name: 'Note Microservice', status: 'operational', uptime: 99.95, latency: 120, region: 'US-East' },
    { name: 'Vector DB Cluster', status: 'operational', uptime: 99.90, latency: 250, region: 'US-East' },
    { name: 'Voice Neural Engine', status: 'operational', uptime: 99.85, latency: 80, region: 'EU-Central' },
    { name: 'Asset Storage (S3)', status: 'operational', uptime: 99.99, latency: 50, region: 'Asia-South' },
    { name: 'Gemini Interface', status: 'operational', uptime: 99.99, latency: 600, region: 'Google Cloud' },
];

export class SystemService {
    
    static getServiceStatus(): ServiceStatus[] {
        // Simulate slight random fluctuations
        return MOCK_SERVICES.map(s => ({
            ...s,
            latency: Math.max(10, s.latency + (Math.random() * 40 - 20)),
            // Randomly degrade a service occasionally for realism
            status: Math.random() > 0.98 ? 'degraded' : 'operational'
        }));
    }

    // Maps backend services to frontend modules for the Alert System
    static getModuleHealthStatus(): Record<Module, ModuleHealth> {
        const statuses = this.getServiceStatus();
        const health: Record<string, ModuleHealth> = {};

        // Helper to find service status
        const check = (svcName: string): ModuleHealth['status'] => {
            const svc = statuses.find(s => s.name === svcName);
            if (!svc) return 'healthy';
            if (svc.status === 'degraded') return 'warning';
            if (svc.status === 'maintenance') return 'error';
            return 'healthy';
        };

        // Notes -> Note Microservice + Vector DB
        const noteStatus = check('Note Microservice') === 'healthy' && check('Vector DB Cluster') === 'healthy' ? 'healthy' : 'warning';
        health['notes'] = {
            moduleId: 'notes',
            status: noteStatus,
            issue: noteStatus !== 'healthy' ? 'Sync latency high or Vector Index degraded.' : undefined,
            fixAction: 'Re-index database'
        };

        // Voice -> Voice Neural Engine
        const voiceStatus = check('Voice Neural Engine');
        health['voice'] = {
            moduleId: 'voice',
            status: voiceStatus,
            issue: voiceStatus !== 'healthy' ? 'Speech processing API timeout.' : undefined,
            fixAction: 'Reconnect WebSocket'
        };

        // Chat -> Gemini Interface
        const chatStatus = check('Gemini Interface');
        health['chat'] = {
            moduleId: 'chat',
            status: chatStatus,
            issue: chatStatus !== 'healthy' ? 'AI Model response delayed.' : undefined,
            fixAction: 'Switch to backup model'
        };

        // Drive -> Asset Storage
        const driveStatus = check('Asset Storage (S3)');
        health['drive'] = {
            moduleId: 'drive',
            status: driveStatus,
            issue: driveStatus !== 'healthy' ? 'Upload bandwidth constrained.' : undefined,
            fixAction: 'Retry connection'
        };

        // Simulation: Randomly force an error on one module for demo purposes if everything is too healthy
        if (Math.random() > 0.7) {
            const targets: Module[] = ['voice', 'logos', 'chat'];
            const target = targets[Math.floor(Math.random() * targets.length)];
            health[target] = {
                moduleId: target,
                status: 'error',
                issue: `CMC Integrity Check Failed: ${target} module config mismatch.`,
                fixAction: 'Run Auto-Repair'
            };
        }

        return health as Record<Module, ModuleHealth>;
    }

    static generateLogs(count: number = 5): SystemLog[] {
        const modules = ['AUTH', 'DB', 'API', 'AI', 'SEC'];
        const messages = [
            'Token validation successful',
            'Vector index re-balanced',
            'Incoming request from IP 192.168.x.x',
            'Garbage collection triggered',
            'Optimization routine started',
            'Encrypted packet received',
            'Cache miss, fetching from disk'
        ];
        
        return Array.from({ length: count }).map(() => ({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            level: Math.random() > 0.9 ? 'warn' : 'info',
            module: modules[Math.floor(Math.random() * modules.length)],
            message: messages[Math.floor(Math.random() * messages.length)]
        }));
    }

    // --- AI OPTIMIZATION ENGINE ---

    static async runWeeklyOptimization(): Promise<OptimizationReport> {
        try {
            // Ask Gemini to generate a realistic looking tech report
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `
                You are the Autonomous Optimization Engine for ParSam Studio.
                Generate a technical Weekly Optimization Report JSON.
                
                Context:
                - The system uses React, LocalStorage, simulated Vector DB, and Gemini API.
                - Analyze hypothetical performance metrics.
                
                Return JSON format:
                {
                    "improvements": ["array of 3 short bullet points, e.g. Reduced bundle size by 5%"],
                    "codeChanges": "A short markdown code snippet showing a refactored React hook or algorithm",
                    "dbOptimizations": "Description of database index changes",
                    "securityPatches": ["array of 2 security items, e.g. Updated CSP headers"]
                }
                Do not include markdown formatting like \`\`\`json. Return raw JSON.
                `
            });

            const text = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "{}";
            const data = JSON.parse(text);

            return {
                id: crypto.randomUUID(),
                date: Date.now(),
                improvements: data.improvements || ["Optimized React rendering"],
                codeChanges: data.codeChanges || "No changes",
                dbOptimizations: data.dbOptimizations || "Indices stable",
                securityPatches: data.securityPatches || ["Token rotation check"],
                status: 'pending'
            };

        } catch (e) {
            console.error("Optimization failed", e);
            return {
                id: crypto.randomUUID(),
                date: Date.now(),
                improvements: ["General system stability check"],
                codeChanges: "const optimize = () => true;",
                dbOptimizations: "Vacuumed deleted rows",
                securityPatches: ["Firewall rules updated"],
                status: 'pending'
            };
        }
    }

    static applyPatches(reportId: string): void {
        // In a real app, this would deploy code.
        // Here we simulate it by setting a flag in storage.
        const history = this.getOptimizationHistory();
        const updated = history.map(r => r.id === reportId ? { ...r, status: 'applied' as const } : r);
        localStorage.setItem('parsam_opt_history', JSON.stringify(updated));
    }

    static getOptimizationHistory(): OptimizationReport[] {
        try {
            const stored = localStorage.getItem('parsam_opt_history');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    static saveOptimizationReport(report: OptimizationReport) {
        const history = this.getOptimizationHistory();
        localStorage.setItem('parsam_opt_history', JSON.stringify([report, ...history]));
    }
}
