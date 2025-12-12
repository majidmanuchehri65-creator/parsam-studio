
import React, { useEffect, useRef, useState } from 'react';
import { VoiceService, VoiceCommand } from '../services/voice';
import { Language, t } from '../services/i18n';
import { Mic, MicOff, Command, FileText, Zap, X } from 'lucide-react';
import { Button } from './Button';
import { ToolHeader } from './ToolParts';

interface VoiceAIProps {
    lang: Language;
    onExecuteCommand: (cmd: VoiceCommand) => void;
    onClose: () => void;
}

export const VoiceAI: React.FC<VoiceAIProps> = ({ lang, onExecuteCommand, onClose }) => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [mode, setMode] = useState<'command' | 'dictation'>('command');
    const [processing, setProcessing] = useState(false);
    const [aiFeedback, setAiFeedback] = useState('');
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const voiceServiceRef = useRef<VoiceService | null>(null);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        voiceServiceRef.current = new VoiceService(
            lang,
            (text, isFinal) => {
                setTranscript(text);
                if (isFinal && mode === 'command') {
                    handleCommand(text);
                }
            },
            (err) => {
                setAiFeedback(`Error: ${err}`);
                setIsListening(false);
            }
        );
        return () => {
            voiceServiceRef.current?.stop();
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    useEffect(() => {
        if (voiceServiceRef.current) {
            voiceServiceRef.current.updateLang(lang);
        }
    }, [lang]);

    const handleCommand = async (text: string) => {
        setProcessing(true);
        setTimeout(async () => {
            setAiFeedback("Analyzing intent...");
            const cmd = await VoiceService.parseIntent(text, lang);
            setProcessing(false);
            if (cmd.action === 'UNKNOWN') {
                setAiFeedback("Command not recognized.");
            } else {
                setAiFeedback(`Executing: ${cmd.action}`);
                onExecuteCommand(cmd);
                setTimeout(() => { setTranscript(''); setAiFeedback(''); }, 2000);
            }
        }, 500);
    };

    const toggleListening = () => {
        if (isListening) {
            voiceServiceRef.current?.stop();
            setIsListening(false);
            cancelAnimationFrame(animationRef.current);
        } else {
            voiceServiceRef.current?.start();
            setIsListening(true);
            setTranscript('');
            setAiFeedback(mode === 'command' ? t('voice.listening', lang) : 'Dictating...');
            drawVisualizer();
        }
    };

    const drawVisualizer = () => {
        if (!canvasRef.current || !voiceServiceRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        const draw = () => {
            const data = voiceServiceRef.current?.getAudioData();
            if (data) {
                const w = canvasRef.current!.width;
                const h = canvasRef.current!.height;
                ctx.clearRect(0, 0, w, h);
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#38bdf8';
                ctx.beginPath();
                const sliceWidth = w * 1.0 / data.length;
                let x = 0;
                for (let i = 0; i < data.length; i++) {
                    const v = data[i] / 128.0;
                    const y = v * h / 2;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                    x += sliceWidth;
                }
                ctx.lineTo(w, h / 2);
                ctx.stroke();
            }
            animationRef.current = requestAnimationFrame(draw);
        };
        draw();
    };

    return (
        <div className="h-full w-full flex flex-col">
             <ToolHeader 
                toolId="voice" 
                lang={lang} 
                icon={<Mic size={28} strokeWidth={1.5} />} 
                className="shrink-0 !py-3"
             >
                 <button onClick={onClose} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                     <X size={20} strokeWidth={1.5} />
                 </button>
             </ToolHeader>

             <div className="flex-1 flex flex-col items-center justify-center relative p-8 overflow-hidden">
                {/* Mode Switcher */}
                <div className="flex gap-2 mb-16 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 shadow-xl z-10">
                    <button 
                        onClick={() => setMode('command')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'command' ? 'bg-parsam-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <Command size={18} strokeWidth={1.5} /> {t('voice.commandMode', lang)}
                    </button>
                    <button 
                        onClick={() => setMode('dictation')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'dictation' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <FileText size={18} strokeWidth={1.5} /> {t('voice.dictationMode', lang)}
                    </button>
                </div>

                {/* Visualizer */}
                <div className="relative mb-12 w-full max-w-xl h-40 flex items-center justify-center z-10">
                    <canvas ref={canvasRef} width={600} height={160} className="w-full h-full opacity-60" />
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <button 
                            onClick={toggleListening}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                                isListening 
                                ? 'bg-red-500 shadow-red-500/40 scale-110 animate-pulse' 
                                : 'bg-slate-900 border-4 border-slate-800 hover:border-parsam-500 group'
                            }`}
                        >
                            {isListening ? <Mic size={40} className="text-white"/> : <MicOff size={40} className="text-slate-500 group-hover:text-slate-300" />}
                        </button>
                    </div>
                </div>

                {/* Transcript Area */}
                <div className="w-full max-w-3xl text-center space-y-8 z-10">
                    <div className="min-h-[80px] text-3xl font-light text-slate-100 leading-relaxed tracking-tight">
                        {transcript || (isListening ? t('voice.listening', lang) : "Tap microphone to speak")}
                    </div>
                    
                    <div className="h-10 flex items-center justify-center gap-2 text-sm font-mono text-parsam-400 bg-slate-900/50 rounded-full py-2 px-6 inline-flex border border-slate-800">
                        {processing && <Zap size={14} className="animate-bounce" />}
                        <span>{aiFeedback}</span>
                    </div>
                    
                    {mode === 'dictation' && transcript && !isListening && (
                        <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                            <Button onClick={() => {
                                onExecuteCommand({ action: 'CREATE_NOTE', payload: { content: transcript } });
                                setTranscript('');
                                setAiFeedback('Note created.');
                            }} className="px-8 py-3">
                                Create Note from Text
                            </Button>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};
