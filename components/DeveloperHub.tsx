
import React, { useState, useEffect } from 'react';
import { OPENAPI_SPEC, ARCHITECTURE_DOCS, PIPELINE_STEPS } from '../services/documentation';
import { Language, t, getDir } from '../services/i18n';
import { 
    Code, GitBranch, Shield, Terminal, CheckCircle, FileJson, Layers, 
    Smartphone, Globe, Monitor, Folder, FileCode, Box
} from 'lucide-react';
import { ToolHeader } from './ToolParts';

interface DeveloperHubProps { lang: Language; }

export const DeveloperHub: React.FC<DeveloperHubProps> = ({ lang }) => {
    const [activeTab, setActiveTab] = useState<'architecture' | 'api' | 'cicd' | 'security' | 'starter'>('architecture');
    const [pipeline, setPipeline] = useState(PIPELINE_STEPS);

    useEffect(() => {
        if (activeTab === 'cicd') {
            const interval = setInterval(() => {
                setPipeline(prev => {
                    const nextPending = prev.findIndex(p => p.status === 'pending');
                    const nextProcessing = prev.findIndex(p => p.status === 'processing');
                    if (nextProcessing !== -1) {
                        const newArr = [...prev]; newArr[nextProcessing].status = 'success';
                        if (nextProcessing + 1 < newArr.length) newArr[nextProcessing + 1].status = 'processing';
                        return newArr;
                    } else if (nextPending !== -1) {
                        const newArr = [...prev]; newArr[nextPending].status = 'processing';
                        return newArr;
                    }
                    return prev;
                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    const dir = getDir(lang);
    const renderFileTree = (node: any, depth = 0) => (
        <div key={node.name} style={{ paddingLeft: `${depth * 16}px` }} className="py-1.5"><div className="flex items-center gap-2 text-sm text-slate-300 font-mono">{node.children ? <Folder size={16} className="text-blue-400 fill-blue-400/10"/> : <FileCode size={16} className="text-slate-500"/>}<span>{node.name}</span></div>{node.children && node.children.map((child: any) => renderFileTree(child, depth + 1))}</div>
    );

    const TabButton = ({ id, icon, label }: { id: any, icon: React.ReactNode, label: string }) => (
        <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all font-medium ${activeTab === id ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'}`}>
            {icon} {label}
        </button>
    );

    return (
        <div className="flex h-full w-full font-sans overflow-hidden" dir={dir}>
            {/* Sidebar */}
            <div className="w-72 bg-slate-900/50 border-r border-slate-800 flex flex-col overflow-y-auto">
                <ToolHeader toolId="dev" lang={lang} icon={<Terminal size={28} strokeWidth={1.5} />} />

                <div className="p-6 flex-1">
                    <nav className="space-y-1">
                        <TabButton id="architecture" icon={<Layers size={20}/>} label={t('dev.architecture', lang)} />
                        <TabButton id="starter" icon={<Box size={20}/>} label="Starter Kit" />
                        <TabButton id="api" icon={<FileJson size={20}/>} label={t('dev.api', lang)} />
                        <TabButton id="cicd" icon={<GitBranch size={20}/>} label="CI/CD Pipeline" />
                        <TabButton id="security" icon={<Shield size={20}/>} label="Security Audit" />
                    </nav>
                    <div className="mt-8 p-5 bg-slate-950/50 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-3">System Status</div>
                        <div className="flex items-center gap-2 text-xs text-green-400 mb-2 font-bold"><CheckCircle size={12} /> All Systems Operational</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono"><Code size={12} /> v11.0.0-stable</div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
                <div className="flex-1 overflow-y-auto p-10">
                    {activeTab === 'architecture' && (
                        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-bold text-white tracking-tight">System Architecture</h2>
                                <div className="flex gap-3"><span className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-sm"><Globe size={24} className="text-blue-400"/></span><span className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-sm"><Monitor size={24} className="text-purple-400"/></span><span className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-sm"><Smartphone size={24} className="text-green-400"/></span></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {ARCHITECTURE_DOCS.map((doc, idx) => (
                                    <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-colors">
                                        <h3 className="text-xl font-bold text-indigo-400 mb-3">{doc.title}</h3>
                                        <p className="text-sm text-slate-400 mb-6 leading-relaxed">{doc.description}</p>
                                        <ul className="space-y-3">{doc.items.map((item, i) => (<li key={i} className="flex items-start gap-3 text-sm text-slate-300"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />{item}</li>))}</ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Simplified other tabs with updated styling */}
                    {activeTab === 'api' && <div className="max-w-6xl mx-auto h-full flex flex-col animate-in fade-in"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-white">OpenAPI Specification (v3.0)</h2></div><div className="flex-1 bg-[#1e1e1e] rounded-2xl border border-slate-800 p-6 overflow-auto font-mono text-xs leading-relaxed text-blue-300 shadow-2xl"><pre>{JSON.stringify(OPENAPI_SPEC, null, 2)}</pre></div></div>}
                </div>
            </div>
        </div>
    );
};
