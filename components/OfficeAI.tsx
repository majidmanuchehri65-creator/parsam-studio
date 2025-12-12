
import React from 'react';
import { Language, t } from '../services/i18n';
import { ToolHeader } from './ToolParts';
import { Briefcase, FileText, BarChart, Calculator, CheckCircle } from 'lucide-react';

interface OfficeAIProps {
    lang: Language;
}

export const OfficeAI: React.FC<OfficeAIProps> = ({ lang }) => {
    return (
        <div className="flex h-full w-full font-sans overflow-hidden bg-slate-900/20 text-slate-200">
            <div className="w-full h-full flex flex-col">
                <ToolHeader 
                    toolId="office" 
                    lang={lang} 
                    icon={<Briefcase size={28} strokeWidth={1.5} />} 
                />
                
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center space-y-4 max-w-lg">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20">
                            <Briefcase size={40} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">ParSam Office AI</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Your intelligent workspace companion for automating reports, analyzing data, and streamlining documentation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl hover:border-indigo-500/50 transition-colors cursor-pointer group">
                            <div className="p-3 bg-indigo-900/30 w-fit rounded-lg mb-4 text-indigo-400 group-hover:text-indigo-300">
                                <FileText size={24} />
                            </div>
                            <h3 className="font-bold text-white mb-2">Report Generator</h3>
                            <p className="text-xs text-slate-400">Create comprehensive reports from raw data points instantly.</p>
                        </div>
                        
                        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer group">
                            <div className="p-3 bg-purple-900/30 w-fit rounded-lg mb-4 text-purple-400 group-hover:text-purple-300">
                                <BarChart size={24} />
                            </div>
                            <h3 className="font-bold text-white mb-2">Data Insights</h3>
                            <p className="text-xs text-slate-400">Visualize trends and extract actionable insights from spreadsheets.</p>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl hover:border-green-500/50 transition-colors cursor-pointer group">
                            <div className="p-3 bg-green-900/30 w-fit rounded-lg mb-4 text-green-400 group-hover:text-green-300">
                                <Calculator size={24} />
                            </div>
                            <h3 className="font-bold text-white mb-2">Smart Calculations</h3>
                            <p className="text-xs text-slate-400">Perform complex financial modeling with natural language prompts.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/10 px-3 py-1.5 rounded-full border border-green-900/30">
                        <CheckCircle size={12} />
                        <span>Module Active & Ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
