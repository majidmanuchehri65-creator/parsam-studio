
import React, { useState, useEffect } from 'react';
import { SetupService } from '../services/setup';
import { StorageService } from '../services/storage';
import { SystemSpecs, AutoTestResult, SetupStage } from '../types';
import { Language, t } from '../services/i18n';
import { CheckCircle, AlertTriangle, Cpu, Globe, Moon, Sun, Monitor, HardDrive, ShieldCheck, Play, ArrowRight, Loader2, Sparkles, FolderOpen, NotebookPen } from 'lucide-react';
import { Button } from './Button';

interface OnboardingWizardProps {
    onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
    const [stage, setStage] = useState<SetupStage['id']>('welcome');
    const [specs, setSpecs] = useState<SystemSpecs | null>(null);
    const [testResults, setTestResults] = useState<AutoTestResult[]>([]);
    const [lang, setLang] = useState<Language>('en');
    const [isDark, setIsDark] = useState(true);
    const [loading, setLoading] = useState(false);

    // --- STEP 1: WELCOME ---
    const handleStart = () => {
        setStage('system');
        runSystemCheck();
    };

    // --- STEP 2: SYSTEM CHECK ---
    const runSystemCheck = async () => {
        setLoading(true);
        const s = await SetupService.checkSystemRequirements();
        setSpecs(s);
        setLoading(false);
    };

    // --- STEP 3: CONFIGURATION ---
    const confirmConfig = () => {
        StorageService.saveSettings({ language: lang, theme: isDark ? 'dark' : 'light' });
        setStage('modules');
        runModuleTests();
    };

    // --- STEP 4: AUTO-TESTING ---
    const runModuleTests = async () => {
        setLoading(true);
        await SetupService.initializeDefaults();
        const results = await SetupService.runModuleTests();
        setTestResults(results);
        setLoading(false);
    };

    // --- STEP 5: TUTORIAL ---
    // (Rendered in JSX)

    // --- STEP 6: FINISH ---
    const handleFinish = () => {
        StorageService.completeSetup();
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
                {/* Header */}
                <div className="h-2 bg-slate-800 w-full">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" 
                        style={{ width: stage === 'welcome' ? '10%' : stage === 'system' ? '30%' : stage === 'config' ? '50%' : stage === 'modules' ? '70%' : stage === 'tutorial' ? '90%' : '100%' }} 
                    />
                </div>

                <div className="p-10 min-h-[500px] flex flex-col">
                    
                    {/* STAGE: WELCOME */}
                    {stage === 'welcome' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                                <span className="font-extrabold text-4xl">P</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight">Welcome to ParSam Studio</h1>
                            <p className="text-slate-400 text-lg max-w-md">
                                Your secure, AI-powered productivity ecosystem. We'll set up your environment, verify drivers, and configure your modules automatically.
                            </p>
                            <Button size="lg" onClick={handleStart} className="mt-8 px-10 py-4 text-lg">
                                Start Automated Setup <ArrowRight className="ml-2" />
                            </Button>
                        </div>
                    )}

                    {/* STAGE: SYSTEM CHECK */}
                    {stage === 'system' && (
                        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in">
                            <h2 className="text-2xl font-bold flex items-center gap-3"><Cpu className="text-blue-400"/> System Diagnostics</h2>
                            {loading ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                                    <Loader2 size={48} className="animate-spin text-blue-500" />
                                    <p>Analyzing hardware capabilities...</p>
                                </div>
                            ) : specs ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                            <div className="text-xs text-slate-500 uppercase font-bold">Operating System</div>
                                            <div className="text-lg font-mono">{specs.os}</div>
                                        </div>
                                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                            <div className="text-xs text-slate-500 uppercase font-bold">Browser Engine</div>
                                            <div className="text-lg font-mono">{specs.browser}</div>
                                        </div>
                                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                            <div className="text-xs text-slate-500 uppercase font-bold">Logical Cores</div>
                                            <div className="text-lg font-mono text-green-400">{specs.cores}</div>
                                        </div>
                                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                            <div className="text-xs text-slate-500 uppercase font-bold">Memory (Approx)</div>
                                            <div className="text-lg font-mono text-green-400">~{specs.memory} GB</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${specs.webgl ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-red-900/20 border-red-500/50 text-red-400'}`}>
                                            <Monitor size={16} /> WebGL {specs.webgl ? 'Active' : 'Missing'}
                                        </div>
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${specs.audio ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-red-900/20 border-red-500/50 text-red-400'}`}>
                                            <SpeakerIcon /> Audio Drivers {specs.audio ? 'Ready' : 'Error'}
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-6 flex justify-end">
                                        <Button onClick={() => setStage('config')}>Continue</Button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* STAGE: CONFIG */}
                    {stage === 'config' && (
                        <div className="flex-1 flex flex-col space-y-8 animate-in fade-in">
                            <h2 className="text-2xl font-bold flex items-center gap-3"><Sparkles className="text-purple-400"/> Personalization</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Interface Language</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['en', 'de', 'fa'].map((l) => (
                                            <button 
                                                key={l}
                                                onClick={() => setLang(l as Language)}
                                                className={`p-4 rounded-xl border text-center transition-all ${lang === l ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                                            >
                                                <Globe className="mx-auto mb-2" size={20} />
                                                {l === 'en' ? 'English' : l === 'de' ? 'Deutsch' : 'فارسی'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Default Theme</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setIsDark(true)}
                                            className={`p-4 rounded-xl border text-center transition-all flex items-center justify-center gap-3 ${isDark ? 'bg-slate-800 border-slate-600 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                        >
                                            <Moon size={20} /> Dark Mode (Rec.)
                                        </button>
                                        <button 
                                            onClick={() => setIsDark(false)}
                                            className={`p-4 rounded-xl border text-center transition-all flex items-center justify-center gap-3 ${!isDark ? 'bg-slate-200 border-slate-300 text-slate-900 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                        >
                                            <Sun size={20} /> Light Mode
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex justify-end">
                                <Button onClick={confirmConfig}>Save & Initialize</Button>
                            </div>
                        </div>
                    )}

                    {/* STAGE: MODULES */}
                    {stage === 'modules' && (
                        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in">
                            <h2 className="text-2xl font-bold flex items-center gap-3"><ShieldCheck className="text-green-400"/> Installing Modules</h2>
                            
                            <div className="space-y-3 bg-black/20 p-4 rounded-2xl h-64 overflow-y-auto custom-scrollbar">
                                {loading && testResults.length === 0 && (
                                    <div className="flex items-center gap-3 text-slate-400 p-2">
                                        <Loader2 className="animate-spin" size={16} /> Initializing core services...
                                    </div>
                                )}
                                {testResults.map((res, i) => (
                                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${res.passed ? 'bg-green-900/10 border-green-900/30' : 'bg-red-900/10 border-red-900/30'} animate-in slide-in-from-left-2`} style={{animationDelay: `${i*100}ms`}}>
                                        <div className="flex items-center gap-3">
                                            {res.passed ? <CheckCircle size={18} className="text-green-400"/> : <AlertTriangle size={18} className="text-red-400"/>}
                                            <span className="font-medium text-sm">{res.module}</span>
                                        </div>
                                        <span className="text-xs opacity-70">{res.message}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <HardDrive size={20} className="text-blue-400"/>
                                    <div className="text-sm">
                                        <div className="font-bold text-white">Automated Backup</div>
                                        <div className="text-slate-500 text-xs">Scheduled: Daily @ 03:00 AM</div>
                                    </div>
                                </div>
                                <div className="text-green-400 text-xs font-bold bg-green-900/20 px-2 py-1 rounded">ACTIVE</div>
                            </div>

                            {!loading && (
                                <div className="mt-auto flex justify-end">
                                    <Button onClick={() => setStage('tutorial')}>Next: Quick Tour</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STAGE: TUTORIAL */}
                    {stage === 'tutorial' && (
                        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in text-center items-center justify-center">
                            <h2 className="text-3xl font-bold text-white mb-6">You're All Set!</h2>
                            
                            <div className="grid grid-cols-3 gap-6 w-full mb-8">
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center gap-3">
                                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-400"><NotebookPen size={24}/></div>
                                    <div className="text-sm font-bold">Smart Notes</div>
                                    <p className="text-xs text-slate-500">AI-powered writing & dictation.</p>
                                </div>
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center gap-3">
                                    <div className="p-3 bg-purple-500/10 rounded-full text-purple-400"><FolderOpen size={24}/></div>
                                    <div className="text-sm font-bold">File Manager</div>
                                    <p className="text-xs text-slate-500">Secure storage & OCR analysis.</p>
                                </div>
                                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center gap-3">
                                    <div className="p-3 bg-green-500/10 rounded-full text-green-400"><Sparkles size={24}/></div>
                                    <div className="text-sm font-bold">Global Chat</div>
                                    <p className="text-xs text-slate-500">Ask your data anything.</p>
                                </div>
                            </div>

                            <Button size="lg" onClick={handleFinish} className="px-12 py-4 text-lg shadow-xl shadow-blue-600/20 animate-pulse">
                                Launch ParSam Studio <Play className="ml-2 fill-current" />
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

const SpeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
);
