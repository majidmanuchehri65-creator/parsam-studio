
import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/database';
import { InfrastructureService } from '../services/infrastructure';
import { CloudNode, SecurityEvent, User, SystemLog } from '../types';
import { Language, t } from '../services/i18n';
import { 
    Activity, Shield, Cpu, Terminal, 
    Database, Globe, Lock, HardDrive, 
    Users, Grid, ArrowUpRight, Search, DownloadCloud, ShieldCheck
} from 'lucide-react';
import { UpdateManager } from './UpdateManager';
import { SelfHealingPanel } from './SelfHealingPanel';
import { ToolHeader } from './ToolParts';

interface SystemCoreProps { lang: Language; }

export const SystemCore: React.FC<SystemCoreProps> = ({ lang }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'updates' | 'healing' | 'cloud' | 'security' | 'logs'>('dashboard');
    const [nodes, setNodes] = useState<CloudNode[]>([]);
    const [threats, setThreats] = useState<SecurityEvent[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [trafficHistory, setTrafficHistory] = useState<number[]>([]);

    useEffect(() => {
        setUsers(DatabaseService.Users.all());
        setLogs(DatabaseService.Logs.recent(20));
        setTrafficHistory(InfrastructureService.getMetricsHistory());
        const interval = setInterval(() => {
            setNodes(InfrastructureService.getNodes());
            if (Math.random() > 0.7) setThreats(prev => [...InfrastructureService.generateThreats(1), ...prev].slice(0, 10));
            setTrafficHistory(prev => [...prev.slice(1), Math.floor(Math.random() * 50) + 20]);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const TabButton = ({ id, icon, label }: { id: any, icon: React.ReactNode, label: string }) => (
        <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all font-medium ${activeTab === id ? 'bg-parsam-900/40 text-parsam-300 border border-parsam-500/20 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'}`}>
            {icon} {label}
        </button>
    );

    return (
        <div className="flex h-full w-full font-sans overflow-hidden">
            {/* CMC Sidebar */}
            <div className="w-72 bg-slate-900/50 border-r border-slate-800 flex flex-col overflow-y-auto">
                <ToolHeader toolId="system" lang={lang} icon={<Cpu size={28} strokeWidth={1.5} />} />

                <div className="p-6 flex-1">
                    <div className="space-y-1">
                        <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-2">Management</div>
                        <TabButton id="dashboard" icon={<Grid size={20}/>} label={t('system.dashboard', lang)} />
                        <TabButton id="users" icon={<Users size={20}/>} label={t('system.users', lang)} />
                        <TabButton id="updates" icon={<DownloadCloud size={20}/>} label={t('system.updates', lang)} />
                        <TabButton id="healing" icon={<ShieldCheck size={20}/>} label={t('system.healing', lang)} />
                        
                        <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8">Infrastructure</div>
                        <TabButton id="cloud" icon={<Globe size={20}/>} label={t('system.cloud', lang)} />
                        <TabButton id="security" icon={<Shield size={20}/>} label={t('system.security', lang)} />
                        <TabButton id="logs" icon={<Terminal size={20}/>} label={t('system.logs', lang)} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { icon: Users, label: 'Total Users', value: users.length, sub: '+5 this week', subIcon: ArrowUpRight, color: 'text-white' },
                                    { icon: HardDrive, label: 'Storage Used', value: '4.2 TB', sub: '15% Capacity', subIcon: CheckCircleIcon, color: 'text-white' },
                                    { icon: Activity, label: 'Global QPS', value: '8.5k', sub: 'Peak: 12k', subIcon: Activity, color: 'text-blue-400' },
                                    { icon: Shield, label: 'Threats Blocked', value: '1,402', sub: 'Last 24h', subIcon: ShieldCheck, color: 'text-red-400' }
                                ].map((card, i) => (
                                    <div key={i} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><card.icon size={80}/></div>
                                        <div className="text-slate-500 text-xs font-bold uppercase mb-2">{card.label}</div>
                                        <div className="text-4xl font-bold text-white tracking-tight mb-3">{card.value}</div>
                                        <div className={`${card.color} text-xs flex items-center gap-1.5 font-bold opacity-80`}><card.subIcon size={14}/> {card.sub}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
                                <h3 className="font-bold text-slate-200 mb-8 flex items-center gap-3"><Activity size={24} className="text-parsam-500"/> Real-time Global Traffic</h3>
                                <div className="h-48 flex items-end gap-1.5">
                                    {trafficHistory.map((h, i) => (
                                        <div key={i} className="flex-1 bg-slate-800 rounded-t-sm hover:bg-parsam-600/50 transition-colors relative group" style={{ height: `${h}%` }}>
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-mono">{h * 100} req/s</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'healing' && <div className="animate-in fade-in slide-in-from-right"><SelfHealingPanel /></div>}
                    {activeTab === 'updates' && <div className="animate-in fade-in slide-in-from-right"><UpdateManager /></div>}
                    {activeTab === 'users' && (
                        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                                <h3 className="font-bold text-white flex items-center gap-3"><Users size={20}/> User Database</h3>
                                <div className="relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/><input placeholder="Search users..." className="bg-slate-950 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 outline-none focus:border-parsam-500 w-72"/></div>
                            </div>
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-slate-950 text-xs uppercase font-bold text-slate-500"><tr><th className="px-8 py-4">User</th><th className="px-8 py-4">Status</th><th className="px-8 py-4">Role</th><th className="px-8 py-4">2FA</th><th className="px-8 py-4">Joined</th></tr></thead>
                                <tbody className="divide-y divide-slate-800">{users.map(user => (<tr key={user.id} className="hover:bg-slate-800/50 transition-colors"><td className="px-8 py-5"><div className="font-bold text-slate-200">{user.fullName}</div><div className="text-xs">{user.email}</div></td><td className="px-8 py-5">{user.isVerified ? <span className="bg-green-500/10 text-green-400 px-2.5 py-1 rounded-md text-xs font-bold border border-green-500/20">Verified</span> : <span className="bg-yellow-500/10 text-yellow-400 px-2.5 py-1 rounded-md text-xs font-bold border border-yellow-500/20">Pending</span>}</td><td className="px-8 py-5 uppercase text-xs font-bold">{user.role}</td><td className="px-8 py-5">{user.twoFactorEnabled ? <Lock size={16} className="text-green-400"/> : <span className="text-slate-700">-</span>}</td><td className="px-8 py-5 font-mono text-xs">{new Date(user.createdAt).toLocaleDateString()}</td></tr>))}</tbody>
                            </table>
                        </div>
                    )}
                    {/* Simplified remaining tabs */}
                    {activeTab === 'cloud' && <div className="text-slate-400 p-4">Cloud Topology Visualization Placeholder (Styled)</div>}
                    {activeTab === 'security' && <div className="text-slate-400 p-4">Security Mesh Visualization Placeholder (Styled)</div>}
                    {activeTab === 'logs' && <div className="text-slate-400 p-4">System Logs Placeholder (Styled)</div>}
                </div>
            </div>
        </div>
    );
};

const CheckCircleIcon = ({size, className}: {size:number, className:string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
