
import { CloudNode, SecurityEvent } from '../types';

export class InfrastructureService {
    
    private static nodes: CloudNode[] = [
        // US EAST CLUSTER
        { id: 'lb-us-01', name: 'LB-US-East', type: 'balancer', region: 'US-East', status: 'healthy', metrics: { cpu: 45, memory: 30, latency: 25, requests: 1200 }, uptime: 154000 },
        { id: 'api-us-01', name: 'API-US-Primary', type: 'api', region: 'US-East', status: 'healthy', metrics: { cpu: 65, memory: 55, latency: 45, requests: 800 }, uptime: 154000 },
        { id: 'db-us-01', name: 'DB-Cluster-Master', type: 'db', region: 'US-East', status: 'healthy', metrics: { cpu: 70, memory: 80, latency: 5, requests: 2500 }, uptime: 2500000 },
        { id: 'vec-us-01', name: 'Vector-Index-01', type: 'vector', region: 'US-East', status: 'healthy', metrics: { cpu: 55, memory: 75, latency: 120, requests: 150 }, uptime: 120000 },
        
        // EU CENTRAL CLUSTER
        { id: 'lb-eu-01', name: 'LB-EU-Central', type: 'balancer', region: 'EU-Central', status: 'healthy', metrics: { cpu: 30, memory: 25, latency: 35, requests: 600 }, uptime: 80000 },
        { id: 'api-eu-01', name: 'API-EU-Replica', type: 'api', region: 'EU-Central', status: 'healthy', metrics: { cpu: 40, memory: 40, latency: 50, requests: 400 }, uptime: 80000 },
        
        // GLOBAL
        { id: 'auth-01', name: 'Auth-Gateway', type: 'auth', region: 'US-East', status: 'healthy', metrics: { cpu: 20, memory: 15, latency: 15, requests: 2000 }, uptime: 3000000 },
        { id: 's3-01', name: 'Obj-Store-V2', type: 'storage', region: 'Asia-South', status: 'healthy', metrics: { cpu: 45, memory: 60, latency: 80, requests: 500 }, uptime: 400000 },
    ];

    static getNodes(): CloudNode[] {
        // Simulate real-time fluctuations
        return this.nodes.map(n => ({
            ...n,
            metrics: {
                cpu: Math.min(100, Math.max(0, n.metrics.cpu + (Math.random() * 10 - 5))),
                memory: Math.min(100, Math.max(0, n.metrics.memory + (Math.random() * 5 - 2.5))),
                latency: Math.max(5, n.metrics.latency + (Math.random() * 10 - 5)),
                requests: Math.max(0, Math.floor(n.metrics.requests + (Math.random() * 100 - 50)))
            },
            status: Math.random() > 0.995 ? 'degraded' : 'healthy' // Occasional glitch
        }));
    }

    static generateThreats(count: number = 3): SecurityEvent[] {
        const types: SecurityEvent['type'][] = ['ddos', 'auth_fail', 'sql_injection', 'bot_traffic'];
        const ips = ['45.22.19.112', '109.234.11.2', '89.22.1.4', '192.168.1.105', '10.0.0.5'];
        
        return Array.from({ length: count }).map(() => ({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: types[Math.floor(Math.random() * types.length)],
            severity: Math.random() > 0.8 ? 'high' : 'medium',
            sourceIp: ips[Math.floor(Math.random() * ips.length)],
            targetNode: this.nodes[Math.floor(Math.random() * this.nodes.length)].name,
            actionTaken: 'blocked'
        }));
    }

    static getMetricsHistory(): number[] {
        // Generate a fake history array for charts
        return Array.from({length: 20}, () => Math.floor(Math.random() * 50) + 20);
    }
}
