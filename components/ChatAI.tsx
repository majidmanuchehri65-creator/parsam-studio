
import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/gemini';
import { Language, t } from '../services/i18n';
import { Send, Plus, Trash2, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { ToolHeader } from './ToolParts';

interface ChatAIProps { lang: Language; onExecuteAction: (action: string, payload: any) => void; }

export const ChatAI: React.FC<ChatAIProps> = ({ lang, onExecuteAction }) => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { loadSessions(); }, []);
    useEffect(() => { scrollToBottom(); }, [activeSessionId, sessions]);
    const loadSessions = () => {
        const s = StorageService.getChatSessions();
        setSessions(s);
        if (s.length > 0 && !activeSessionId) setActiveSessionId(s[0].id);
        else if (s.length === 0) handleNewSession();
    };
    const handleNewSession = () => {
        const newSession = StorageService.createChatSession();
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
    };
    const handleDeleteSession = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        StorageService.deleteChatSession(id);
        const remaining = sessions.filter(s => s.id !== id);
        setSessions(remaining);
        if (activeSessionId === id) setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    };
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !activeSessionId || loading) return;
        if (!StorageService.checkRateLimit()) { alert("Daily AI rate limit reached."); return; }
        const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: input, timestamp: Date.now() };
        const updatedSessions = sessions.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, userMsg], updatedAt: Date.now() } : s);
        setSessions(updatedSessions);
        StorageService.saveChatSession(updatedSessions.find(s => s.id === activeSessionId)!);
        setInput(''); setLoading(true);
        try {
            const currentSession = updatedSessions.find(s => s.id === activeSessionId);
            const history = currentSession ? currentSession.messages : [];
            const response = await GeminiService.chatGlobal(userMsg.text, history, lang);
            if (response.toolCalls) response.toolCalls.forEach(tool => onExecuteAction(tool.name, tool.args));
            const botMsg: ChatMessage = { id: crypto.randomUUID(), role: 'model', text: response.text, timestamp: Date.now() };
            const finalSessions = updatedSessions.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, botMsg], updatedAt: Date.now() } : s);
            setSessions(finalSessions);
            StorageService.saveChatSession(finalSessions.find(s => s.id === activeSessionId)!);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    const activeSession = sessions.find(s => s.id === activeSessionId);

    return (
        <div className="flex h-full w-full font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 bg-slate-900/50 border-r border-slate-800 flex flex-col hidden md:flex">
                <ToolHeader toolId="chat" lang={lang} icon={<Sparkles size={28} strokeWidth={1.5} />} />
                
                <div className="p-4">
                    <Button onClick={handleNewSession} className="w-full justify-start py-3" icon={<Plus size={20}/>} variant="secondary">
                        {t('chat.newChat', lang)}
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {sessions.map(session => (
                        <div key={session.id} onClick={() => setActiveSessionId(session.id)} className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeSessionId === session.id ? 'bg-slate-800 border border-slate-700 shadow-sm' : 'text-slate-400 hover:bg-slate-800/30'}`}>
                            <div className="flex items-center gap-3 truncate"><MessageSquare size={18} /><span className="text-sm font-medium truncate max-w-[140px]">{session.messages[0]?.text || session.title}</span></div>
                            <button onClick={(e) => handleDeleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1.5 hover:bg-red-900/10 rounded"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat */}
            <div className="flex-1 flex flex-col relative bg-black/10">
                <div className="md:hidden h-16 border-b border-slate-800 flex items-center px-6 bg-slate-900/50"><Sparkles size={24} className="text-parsam-400 mr-3"/><span className="font-bold text-lg">{t('chat.title', lang)}</span></div>
                <div className="absolute top-6 right-6 z-10 hidden md:block"><div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-full px-4 py-1.5 flex items-center gap-2 text-xs text-slate-400 font-medium"><Sparkles size={12} className="text-parsam-400" /> Context Active</div></div>
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
                    {!activeSession || activeSession.messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6">
                            <Sparkles size={64} strokeWidth={1} className="opacity-10" />
                            <h3 className="text-2xl font-bold text-slate-300">How can I help you today?</h3>
                        </div>
                    ) : (
                        activeSession.messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-3xl ${msg.role === 'user' ? 'bg-parsam-600 text-white rounded-br-md shadow-lg' : 'bg-slate-800 text-slate-200 rounded-bl-md border border-slate-700'}`}>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
                                </div>
                            </div>
                        ))
                    )}
                    {loading && <div className="flex justify-start"><div className="bg-slate-800 rounded-3xl rounded-bl-md px-6 py-4 flex gap-1.5"><span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" /><span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75" /><span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150" /></div></div>}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-6 border-t border-slate-800 bg-slate-900/40 backdrop-blur shrink-0">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
                        <input value={input} onChange={e => setInput(e.target.value)} placeholder={t('chat.placeholder', lang)} className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl py-4 pl-6 pr-14 text-slate-200 focus:border-parsam-500 outline-none shadow-lg transition-all focus:bg-slate-900" />
                        <button type="submit" disabled={!input.trim() || loading} className="absolute right-3 top-3 p-2 bg-parsam-600 hover:bg-parsam-500 text-white rounded-xl disabled:opacity-50 disabled:bg-slate-800 transition-all shadow-md"><Send size={20} /></button>
                    </form>
                </div>
            </div>
        </div>
    );
};
