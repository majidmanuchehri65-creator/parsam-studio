import React, { useState } from 'react';
import { getToolInfo } from '../services/toolInfo';
import { Language, getDir } from '../services/i18n';
import { Info, X } from 'lucide-react';

interface ToolHeaderProps {
    toolId: string;
    lang: Language;
    icon: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({ toolId, lang, icon, children, className = '' }) => {
    const [showInfo, setShowInfo] = useState(false);
    const info = getToolInfo(toolId, lang);
    const dir = getDir(lang);

    return (
        <>
            {showInfo && <ToolInfoModal toolId={toolId} lang={lang} onClose={() => setShowInfo(false)} />}
            <div className={`p-6 border-b border-white/5 flex items-center justify-between bg-parsam-panel/50 backdrop-blur-sm sticky top-0 z-10 transition-colors duration-300 ${className}`} dir={dir}>
                <div className="flex items-center gap-4 text-parsam-primary">
                    <div className="p-2.5 bg-parsam-bg/60 rounded-xl border border-white/5 shadow-sm text-parsam-primary animate-enter hover:bg-parsam-hover transition-colors">
                        {icon}
                    </div>
                    <div className="animate-enter" style={{animationDelay: '0.1s'}}>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold tracking-tight text-white leading-none drop-shadow-sm">{info.title}</h2>
                            <button 
                                onClick={() => setShowInfo(true)}
                                className="p-1 text-parsam-muted hover:text-white hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-white/10 focus:outline-none focus:ring-2 focus:ring-parsam-primary/50"
                                title="Tool Description"
                                aria-label={`Tool Description for ${info.title}`}
                            >
                                <Info size={18} strokeWidth={2} />
                            </button>
                        </div>
                        <p className="text-[10px] text-parsam-muted font-mono tracking-widest uppercase mt-1 opacity-80">
                            PRO v11.0
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 animate-enter" style={{animationDelay: '0.2s'}}>
                    {children}
                </div>
            </div>
        </>
    );
};

interface ToolInfoModalProps {
    toolId: string;
    lang: Language;
    onClose: () => void;
}

export const ToolInfoModal: React.FC<ToolInfoModalProps> = ({ toolId, lang, onClose }) => {
    const info = getToolInfo(toolId, lang);
    const dir = getDir(lang);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-enter" onClick={onClose}>
            <div 
                className="bg-parsam-panel border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden backdrop-blur-xl" 
                dir={dir} 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-parsam-bg/50">
                    <div className="flex items-center gap-2">
                        <Info size={18} className="text-parsam-primary" />
                        <h3 className="font-bold text-slate-200">{lang === 'fa' ? 'توضیحات ابزار' : (lang === 'de' ? 'Werkzeugbeschreibung' : 'Tool Description')}</h3>
                    </div>
                    <button onClick={onClose} className="text-parsam-muted hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"><X size={18}/></button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div>
                        <h4 className="text-xl font-bold text-white mb-2">{info.title}</h4>
                        <p className="text-sm text-parsam-muted leading-relaxed">{info.shortSummary}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 text-sm text-parsam-muted leading-relaxed">
                        <div className="bg-parsam-bg/30 p-4 rounded-xl border border-white/5">
                            <strong className="text-parsam-primary block mb-2 uppercase text-xs tracking-wider font-bold">{lang === 'fa' ? 'هدف' : 'Purpose'}</strong>
                            {info.purpose}
                            <div className="mt-4">
                                <strong className="text-parsam-primary block mb-2 uppercase text-xs tracking-wider font-bold">{lang === 'fa' ? 'عملکرد' : 'What it does'}</strong>
                                {info.description}
                            </div>
                        </div>
                        <div className="bg-parsam-bg/30 p-4 rounded-xl border border-white/5">
                            <strong className="text-parsam-primary block mb-2 uppercase text-xs tracking-wider font-bold">{lang === 'fa' ? 'نحوه استفاده' : 'How to use'}</strong>
                            {info.usage}
                            <div className="mt-4">
                                <strong className="text-parsam-primary block mb-2 uppercase text-xs tracking-wider font-bold">{lang === 'fa' ? 'ویژگی‌های کلیدی' : 'Key Features'}</strong>
                                <ul className="grid grid-cols-2 gap-2 mt-2">
                                    {info.features.map(f => (
                                        <li key={f} className="flex items-center gap-2 text-xs bg-white/5 p-2 rounded border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-parsam-primary shadow-[0_0_8px_rgba(93,173,226,0.5)]"></div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ToolFooter: React.FC<any> = () => null;