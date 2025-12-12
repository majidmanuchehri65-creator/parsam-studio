import React, { useState, useRef, useEffect } from 'react';
import { GeminiService, InspirationAnalysis } from '../services/gemini';
import { Button } from './Button';
import { 
    Sparkles, Download, Save, Palette, Type, Aperture, 
    Image as ImageIcon, Mic, MicOff, Layout, Settings, Eye, 
    Undo, Redo, Info, AlertTriangle, Upload,
    CheckCircle, X, ChevronRight, Layers, Sliders, Cpu, ThumbsUp, ThumbsDown, RefreshCw, Wand2
} from 'lucide-react';
import { Language, t, getDir } from '../services/i18n';
import { ToolHeader, ToolInfoModal } from './ToolParts';

interface LogoMakerProps {
    lang: Language;
    onChangeLang?: (lang: Language) => void;
    onLogout?: () => void;
}

interface GeneratedLogo {
    id: string;
    source: 'Google Gemini' | 'ParSam Native' | 'Banana AI';
    imageUrl: string;
    promptUsed: string;
    score?: number;
    rating?: 'like' | 'dislike';
    timestamp: number;
}

export const LogoMaker: React.FC<LogoMakerProps> = ({ lang, onChangeLang, onLogout }) => {
    // State
    const [prompt, setPrompt] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLogos, setGeneratedLogos] = useState<GeneratedLogo[]>([]);
    const [selectedLogo, setSelectedLogo] = useState<GeneratedLogo | null>(null);
    const [history, setHistory] = useState<GeneratedLogo[]>([]);
    
    // Customization State
    const [brandName, setBrandName] = useState('');
    const [style, setStyle] = useState('Modern');
    const [colorPalette, setColorPalette] = useState<string[]>([]);
    
    // Inspiration
    const [inspirationProfile, setInspirationProfile] = useState<InspirationAnalysis | null>(null);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [analyzingMedia, setAnalyzingMedia] = useState(false);

    // UX
    const [showInfo, setShowInfo] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    const dir = getDir(lang);

    // --- Voice Input ---
    const handleVoice = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice API not supported.");
            return;
        }
        
        if (isListening) {
            // Stop logic handles automatically by browser or toggle
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'de' ? 'de-DE' : lang === 'fa' ? 'fa-IR' : 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (e: any) => {
            const transcript = e.results[0][0].transcript;
            setPrompt(prev => prev + ' ' + transcript);
        };
        recognition.start();
    };

    // --- Media Analysis ---
    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setMediaFile(file);
        setAnalyzingMedia(true);
        
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const profile = await GeminiService.analyzeInspiration([{ mimeType: file.type, data: ev.target?.result as string }]);
                setInspirationProfile(profile);
                if (profile.palette) setColorPalette(profile.palette);
                if (profile.suggestions) setPrompt(prev => prev + ' ' + profile.suggestions);
            } catch(e) { 
                console.error(e);
            } finally { 
                setAnalyzingMedia(false); 
            }
        };
        reader.readAsDataURL(file);
    };

    // --- Multi-AI Generation Engine ---
    const handleGenerate = async () => {
        if (!prompt && !brandName) return;
        setIsGenerating(true);
        setSelectedLogo(null);

        // Define sources
        const sources: GeneratedLogo['source'][] = ['Google Gemini', 'ParSam Native', 'Banana AI'];
        const newLogos: GeneratedLogo[] = [];

        try {
            // Simulate Parallel Execution
            const promises = sources.map(async (source) => {
                // In a real app, dispatch to different endpoints
                // Here we use Gemini for all but vary the prompt slightly to simulate diversity
                const variation = source === 'Banana AI' ? 'Abstract, colorful' : source === 'ParSam Native' ? 'Minimalist vector' : style;
                
                try {
                    const result = await GeminiService.generateLogo(
                        brandName || "Brand", 
                        "", 
                        "General", 
                        variation, 
                        prompt, 
                        inspirationProfile || undefined
                    );
                    
                    return {
                        id: crypto.randomUUID(),
                        source,
                        imageUrl: result.imageUrl,
                        promptUsed: result.prompt,
                        timestamp: Date.now()
                    } as GeneratedLogo;
                } catch (e) {
                    console.error(`${source} failed`, e);
                    return null;
                }
            });

            const results = await Promise.all(promises);
            results.forEach(res => {
                if (res) newLogos.push(res);
            });

            setGeneratedLogos(newLogos);
            setHistory(prev => [...newLogos, ...prev]);

        } catch (e) {
            alert("Generation failed. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Rendering ---

    const Tooltip = ({ id, text }: { id: string, text: string }) => (
        <div className="relative inline-block ml-2 group">
            <Info 
                size={14} 
                className="text-slate-500 hover:text-[#5DADE2] cursor-help transition-colors"
                onMouseEnter={() => setActiveTooltip(id)}
                onMouseLeave={() => setActiveTooltip(null)}
            />
            {activeTooltip === id && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 p-2 bg-[#1E1E2F] border border-[#5DADE2] rounded-lg text-[10px] text-slate-200 z-50 shadow-xl animate-in fade-in zoom-in-95">
                    {text}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full w-full bg-[#1E1E2F] font-sans text-[#F0F0F0] overflow-hidden" dir={dir}>
            {showInfo && <ToolInfoModal toolId="logos" lang={lang} onClose={() => setShowInfo(false)} />}

            {/* Top Toolbar */}
            <div className="h-16 bg-[#1E1E2F] border-b border-[#5DADE2] flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#5DADE2]/10 rounded-lg border border-[#5DADE2]/30">
                        <Aperture size={20} className="text-[#5DADE2]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold tracking-tight">{t('module.logos', lang)}</h2>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/> {t('logo.engineActive', lang)}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" icon={<Settings size={14}/>}>{t('logo.settings', lang)}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowInfo(true)} icon={<Info size={16}/>}>Info</Button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Left Panel: Controls */}
                <div className="w-80 bg-[#27293d] border-r border-[#5DADE2] flex flex-col overflow-y-auto z-10 shadow-xl">
                    <div className="p-6 space-y-8">
                        
                        {/* 1. Concept Section */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between text-[#5DADE2]">
                                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles size={14}/> {t('logo.concept', lang)}
                                </h3>
                                <Tooltip id="concept" text={t('logo.conceptTip', lang)} />
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold mb-1 block">{t('logo.brandName', lang)}</label>
                                    <input 
                                        value={brandName}
                                        onChange={e => setBrandName(e.target.value)}
                                        className="w-full bg-[#1E1E2F] border border-slate-700 focus:border-[#5DADE2] rounded-lg px-3 py-2 text-sm outline-none transition-all"
                                        placeholder={t('logo.brandPlaceholder', lang)}
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold mb-1 block">{t('logo.prompt', lang)}</label>
                                    <div className="relative">
                                        <textarea 
                                            value={prompt}
                                            onChange={e => setPrompt(e.target.value)}
                                            className="w-full h-24 bg-[#1E1E2F] border border-slate-700 focus:border-[#5DADE2] rounded-lg p-3 text-xs outline-none resize-none transition-all"
                                            placeholder={t('logo.promptPlaceholder', lang)}
                                        />
                                        {/* Voice Input Positioned here */}
                                        <button 
                                            onClick={handleVoice}
                                            className={`absolute bottom-2 right-2 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300 hover:text-white'}`}
                                            title="Voice Input"
                                        >
                                            {isListening ? <MicOff size={14}/> : <Mic size={14}/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="w-full h-px bg-slate-700/50" />

                        {/* 2. Inspiration Section (Media Upload) */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between text-[#5DADE2]">
                                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <ImageIcon size={14}/> {t('logo.inspiration', lang)}
                                </h3>
                                <Tooltip id="inspire" text={t('logo.inspireTip', lang)} />
                            </div>

                            <label className={`
                                flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all relative overflow-hidden group
                                ${mediaFile ? 'border-[#5DADE2] bg-[#5DADE2]/5' : 'border-slate-700 hover:border-[#5DADE2] hover:bg-slate-800'}
                            `}>
                                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleMediaUpload} />
                                
                                {analyzingMedia ? (
                                    <div className="flex flex-col items-center text-[#5DADE2]">
                                        <RefreshCw size={20} className="animate-spin mb-2" />
                                        <span className="text-[10px]">{t('logo.analyzing', lang)}</span>
                                    </div>
                                ) : mediaFile ? (
                                    <div className="flex flex-col items-center text-green-400">
                                        <CheckCircle size={20} className="mb-2" />
                                        <span className="text-[10px] font-bold">{mediaFile.name}</span>
                                        <span className="text-[9px] opacity-70">{t('logo.clickChange', lang)}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-500 group-hover:text-slate-300">
                                        <Upload size={20} className="mb-2" />
                                        <span className="text-[10px] font-bold">{t('logo.upload', lang)}</span>
                                    </div>
                                )}
                            </label>

                            {inspirationProfile && (
                                <div className="bg-[#1E1E2F] p-3 rounded-lg border border-slate-700 animate-enter">
                                    <div className="flex items-center gap-2 mb-2 text-[10px] text-slate-400 font-bold uppercase">
                                        <Wand2 size={12} className="text-purple-400" /> {t('logo.insights', lang)}
                                    </div>
                                    <div className="flex gap-1 mb-2">
                                        {colorPalette.map(c => (
                                            <div key={c} className="w-4 h-4 rounded-full border border-white/10" style={{backgroundColor: c}} title={c}/>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-300 italic line-clamp-2">"{inspirationProfile.suggestions}"</p>
                                </div>
                            )}
                        </section>

                        <div className="w-full h-px bg-slate-700/50" />

                        {/* 3. Style & Parameters */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between text-[#5DADE2]">
                                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Sliders size={14}/> {t('logo.params', lang)}
                                </h3>
                                <Tooltip id="params" text={t('logo.paramsTip', lang)} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                {['Modern', 'Vintage', 'Minimalist', '3D Render'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setStyle(s)}
                                        className={`px-2 py-2 rounded-lg text-[10px] font-bold border transition-all ${style === s ? 'bg-[#5DADE2] text-[#1E1E2F] border-[#5DADE2]' : 'bg-[#1E1E2F] text-slate-400 border-slate-700 hover:border-slate-500'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <Button 
                            className="w-full py-4 text-sm font-bold shadow-lg shadow-[#5DADE2]/20" 
                            onClick={handleGenerate} 
                            disabled={isGenerating || (!prompt && !brandName)}
                            loading={isGenerating}
                        >
                            {isGenerating ? t('logo.synthesizing', lang) : t('logo.generate', lang)}
                        </Button>
                    </div>
                </div>

                {/* Center Panel: Canvas & Results */}
                <div className="flex-1 bg-[#151520] relative flex flex-col p-8 overflow-y-auto">
                    
                    {generatedLogos.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-6 opacity-60">
                            <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center animate-pulse-slow">
                                <Cpu size={48} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-400">{t('logo.idleTitle', lang)}</h3>
                                <p className="text-sm mt-2">{t('logo.idleDesc', lang)}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">{t('logo.resultsTitle', lang)}</h3>
                                <span className="text-xs text-[#5DADE2] font-mono border border-[#5DADE2] px-2 py-1 rounded">
                                    {generatedLogos.length} {t('logo.variants', lang)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {generatedLogos.map((logo) => (
                                    <div 
                                        key={logo.id} 
                                        onClick={() => setSelectedLogo(logo)}
                                        className={`
                                            group relative aspect-square bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                                            ${selectedLogo?.id === logo.id ? 'ring-4 ring-[#5DADE2] shadow-2xl scale-[1.02]' : 'hover:ring-2 hover:ring-[#5DADE2]/50 hover:shadow-xl'}
                                        `}
                                    >
                                        <img src={logo.imageUrl} className="w-full h-full object-contain p-8" alt="Logo" />
                                        
                                        {/* Source Badge */}
                                        <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/80 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur border border-white/10 flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${logo.source === 'ParSam Native' ? 'bg-[#5DADE2]' : logo.source === 'Google Gemini' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                                            {logo.source}
                                        </div>

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform flex justify-between items-end">
                                            <div className="flex gap-2">
                                                <button className="p-2 bg-white/10 hover:bg-green-500/80 rounded-full text-white backdrop-blur transition-colors"><ThumbsUp size={16}/></button>
                                                <button className="p-2 bg-white/10 hover:bg-red-500/80 rounded-full text-white backdrop-blur transition-colors"><ThumbsDown size={16}/></button>
                                            </div>
                                            <button className="p-2 bg-[#5DADE2] hover:bg-[#4a90c2] text-white rounded-lg text-xs font-bold shadow-lg">
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: History (Collapsible logic implied by width or state, keeping simple fixed for now) */}
                <div className="w-72 bg-[#27293d] border-l border-[#5DADE2] flex flex-col z-10 hidden xl:flex">
                    <div className="p-4 border-b border-[#5DADE2]/30 flex items-center gap-2 text-[#5DADE2]">
                        <Layers size={18} />
                        <span className="font-bold text-sm">{t('logo.history', lang)}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {history.length === 0 && <div className="text-center text-slate-500 text-xs mt-10">{t('logo.noHistory', lang)}</div>}
                        {history.map(item => (
                            <div key={item.id} onClick={() => setSelectedLogo(item)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-slate-700 transition-all">
                                <img src={item.imageUrl} className="w-10 h-10 rounded bg-white object-contain" alt="thumbnail" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold truncate">{item.source}</div>
                                    <div className="text-xs text-slate-200 truncate">{new Date(item.timestamp).toLocaleTimeString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};