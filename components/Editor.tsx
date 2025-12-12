
import React, { useState, useEffect, useRef } from 'react';
import { Note, AIServiceType, NotePage } from '../types';
import { Language, t, getDir } from '../services/i18n';
import { 
  Sparkles, Mic, PenLine, 
  Bold, Italic, List, CheckSquare, Image as ImageIcon,
  FileText, Trash2, Send, Bot, X,
  Paperclip, Lock, Unlock, Tag, MicOff, Archive, History,
  Network, Plus, ChevronUp, ChevronDown, Download, GripVertical, MoreHorizontal, BookOpen, Edit3
} from 'lucide-react';
import { Button } from './Button';
import { GeminiService } from '../services/gemini';
import { HistoryModal } from './HistoryModal';
import { StorageService } from '../services/storage';
import jsPDF from 'jspdf';

interface EditorProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  onDelete: () => void;
  isTrash: boolean;
  lang: Language;
}

export const Editor: React.FC<EditorProps> = ({ note, onUpdate, onDelete, isTrash, lang }) => {
  const [title, setTitle] = useState(note.title);
  const [pages, setPages] = useState<NotePage[]>(note.pages || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!note.isEncrypted);
  const [lockPassword, setLockPassword] = useState('');
  const [readMode, setReadMode] = useState(false);
  
  const [tagInput, setTagInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Drag and Drop
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);
  
  // Voice & Chat
  const recognitionRef = useRef<any>(null);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const dir = getDir(lang);

  // Initialize Pages
  useEffect(() => {
      if (!note.pages || note.pages.length === 0) {
          const initialPage: NotePage = {
              id: crypto.randomUUID(),
              title: t('editor.page', lang) + ' 1',
              content: note.contentRich || '',
              order: 0
          };
          setPages([initialPage]);
      } else {
          setPages(note.pages);
      }
  }, [note.id]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (title !== note.title) onUpdate({ title });
    }, 500);
    return () => clearTimeout(handler);
  }, [title, note.title]);

  // Sync pages change to storage
  useEffect(() => {
      const handler = setTimeout(() => {
          const fullText = pages.map(p => {
              const tmp = document.createElement('div');
              tmp.innerHTML = p.content;
              return tmp.innerText;
          }).join('\n');
          
          onUpdate({ pages, contentPlain: fullText, contentRich: pages[0]?.content || '' });
      }, 800);
      return () => clearTimeout(handler);
  }, [pages]);

  const handleAddPage = () => {
      const newPage: NotePage = {
          id: crypto.randomUUID(),
          title: `${t('editor.page', lang)} ${pages.length + 1}`,
          content: '',
          order: pages.length
      };
      setPages([...pages, newPage]);
  };

  const handleUpdatePage = (id: string, field: keyof NotePage, value: string) => {
      setPages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDeletePage = (id: string) => {
      if (pages.length <= 1) return;
      if (confirm("Delete this page?")) {
          setPages(prev => prev.filter(p => p.id !== id));
      }
  };

  const handleExportPage = (page: NotePage, format: 'txt' | 'pdf') => {
      if (format === 'txt') {
          const tmp = document.createElement('div');
          tmp.innerHTML = page.content;
          const text = tmp.innerText;
          const blob = new Blob([text], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${note.title}_Page${page.order + 1}.txt`;
          a.click();
          URL.revokeObjectURL(url);
      } else {
          const doc = new jsPDF();
          doc.setFont("helvetica", "bold");
          doc.text(page.title, 10, 10);
          const tmp = document.createElement('div');
          tmp.innerHTML = page.content;
          const lines = doc.splitTextToSize(tmp.innerText, 180);
          doc.setFont("helvetica", "normal");
          doc.text(lines, 10, 20);
          doc.save(`${note.title}_Page${page.order + 1}.pdf`);
      }
  };

  // DnD Handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
      setDraggedPageIndex(index);
      e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
  };
  const onDrop = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedPageIndex === null || draggedPageIndex === index) return;
      const newPages = [...pages];
      const [movedPage] = newPages.splice(draggedPageIndex, 1);
      newPages.splice(index, 0, movedPage);
      setPages(newPages.map((p, i) => ({ ...p, order: i })));
      setDraggedPageIndex(null);
  };

  const toggleListening = () => {
      if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
          return;
      }
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return alert("Voice dictation not supported");
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'de' ? 'de-DE' : lang === 'fa' ? 'fa-IR' : 'en-US';
      recognition.continuous = false; 
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) {
            const lastPage = pages[pages.length - 1];
            handleUpdatePage(lastPage.id, 'content', lastPage.content + ' ' + finalTranscript);
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
  };

  const handleAIAction = async (type: AIServiceType) => {
    setIsProcessing(true);
    const allText = pages.map(p => { const d = document.createElement('div'); d.innerHTML = p.content; return d.innerText; }).join('\n');
    try {
      let result = '';
      if (type === AIServiceType.GENERATE_TITLE) {
          result = await GeminiService.generateTitle(allText);
          setTitle(result);
      } else if (type === AIServiceType.DETECT_TASKS) {
          result = await GeminiService.detectTasks(allText);
          setChatMessages(prev => [...prev, {role: 'model', text: "Tasks:\n" + result}]);
          setShowChat(true);
      }
    } catch (e) { alert("AI Error"); } finally { setIsProcessing(false); }
  };

  if (isTrash) return <div className="flex-1 flex flex-col items-center justify-center text-slate-500"><Trash2 size={48} /><p className="mt-4">{t('editor.trashMsg', lang)}</p><Button variant="danger" onClick={onDelete} className="mt-4">{t('editor.deletePerm', lang)}</Button></div>;
  if (!isUnlocked) return <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-app-panel"><Lock size={48} className="mb-4 text-brand-primary"/><h2 className="text-xl mb-4">{t('editor.secured', lang)}</h2><form onSubmit={(e) => { e.preventDefault(); if(lockPassword) setIsUnlocked(true); }}><input type="password" autoFocus placeholder={t('editor.enterPass', lang)} className="bg-app-bg border border-app-border rounded px-4 py-2 text-white outline-none" value={lockPassword} onChange={e => setLockPassword(e.target.value)} /><Button type="submit" className="w-full mt-2">{t('editor.unlock', lang)}</Button></form></div>;

  return (
    <div className="flex h-full w-full relative bg-app-panel" dir={dir}>
      <HistoryModal note={note} isOpen={showHistory} onClose={() => setShowHistory(false)} onRestore={() => { setPages(note.pages || []); setTitle(note.title); }} lang={lang} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Modern Header */}
        <div className="h-16 shrink-0 z-20 flex items-center px-6 justify-between bg-app-panel/95 border-b border-app-border backdrop-blur-sm">
           <div className="flex items-center gap-4 flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('editor.titlePlaceholder', lang)}
                className="bg-transparent text-xl font-bold text-white placeholder-slate-600 border-none outline-none w-full max-w-md truncate"
              />
           </div>

          <div className="flex items-center gap-2">
             <button onClick={() => setReadMode(!readMode)} className={`p-2.5 rounded-full transition-all ${readMode ? 'bg-brand-primary text-white' : 'text-brand-muted hover:bg-app-hover'}`} title={readMode ? "Edit" : "Read Mode"}>
                {readMode ? <BookOpen size={18} /> : <Edit3 size={18} />}
             </button>
             <button onClick={toggleListening} className={`p-2.5 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-brand-muted hover:bg-app-hover'}`}>
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
             </button>
             <button onClick={() => setShowHistory(true)} className="p-2.5 text-brand-muted hover:text-white hover:bg-app-hover rounded-full transition-all">
                <History size={18} />
             </button>
             <button onClick={() => setShowChat(!showChat)} className={`p-2.5 rounded-full transition-all ${showChat ? 'bg-brand-primary/20 text-brand-primary' : 'text-brand-muted hover:bg-app-hover'}`}>
                <Sparkles size={18} />
             </button>
             <button className="p-2.5 text-brand-muted hover:text-white hover:bg-app-hover rounded-full">
                <MoreHorizontal size={18} />
             </button>
          </div>
        </div>

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto bg-app-panel custom-scrollbar p-6">
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
                {/* Meta & Tags */}
                <div className="flex flex-wrap items-center gap-2 px-2 pb-2">
                    <span className="text-xs text-brand-muted">{new Date(note.updatedAt).toLocaleDateString()}</span>
                    <div className="h-3 w-px bg-app-border mx-2"/>
                    {note.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 bg-app-bg text-brand-muted text-[10px] px-2 py-1 rounded-full border border-app-border">
                            #{tag} <button onClick={() => onUpdate({ tags: note.tags.filter(t => t !== tag) })} className="hover:text-white"><X size={10}/></button>
                        </span>
                    ))}
                    {!readMode && (
                        <div className="flex items-center gap-2">
                             <input 
                                type="text"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); if (!note.tags.includes(tagInput.trim())) onUpdate({ tags: [...note.tags, tagInput.trim()] }); setTagInput(''); } }}
                                placeholder={t('editor.addTag', lang)}
                                className="bg-transparent text-[10px] text-brand-muted placeholder-slate-700 outline-none w-16 focus:w-24 transition-all"
                             />
                        </div>
                    )}
                </div>

                {/* Vertical Page Stack */}
                {pages.map((page, index) => (
                    <PageCard 
                        key={page.id}
                        page={page}
                        index={index}
                        total={pages.length}
                        onUpdate={(field, val) => handleUpdatePage(page.id, field, val)}
                        onDelete={() => handleDeletePage(page.id)}
                        onExport={handleExportPage}
                        lang={lang}
                        isDragging={draggedPageIndex === index}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        readMode={readMode}
                    />
                ))}

                {/* Add Page Button */}
                {!readMode && (
                    <button 
                        onClick={handleAddPage}
                        className="w-full py-4 border-2 border-dashed border-app-border rounded-2xl flex items-center justify-center gap-2 text-brand-muted hover:text-brand-primary hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all group"
                    >
                        <Plus size={20} className="group-hover:scale-110 transition-transform"/>
                        <span className="font-bold text-sm">{t('editor.addPage', lang)}</span>
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Chat AI Overlay */}
      {showChat && (
          <div className="absolute right-0 top-16 bottom-0 w-80 bg-app-surface border-l border-app-border shadow-2xl flex flex-col z-30 animate-in slide-in-from-right">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, i) => (
                      <div key={i} className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-brand-primary text-white ml-auto max-w-[85%]' : 'bg-app-bg text-slate-300 mr-auto max-w-[90%]'}`}>{msg.text}</div>
                  ))}
                  {isChatLoading && <div className="text-xs text-brand-muted animate-pulse">Thinking...</div>}
              </div>
              <form onSubmit={async (e) => {
                  e.preventDefault();
                  if(!chatInput.trim()) return;
                  const newMsgs = [...chatMessages, {role: 'user' as const, text: chatInput}];
                  setChatMessages(newMsgs);
                  setChatInput('');
                  setIsChatLoading(true);
                  try {
                      const res = await GeminiService.chatWithNote(note, chatInput, newMsgs);
                      setChatMessages([...newMsgs, {role: 'model', text: res}]);
                  } catch(err) { setChatMessages([...newMsgs, {role: 'model', text: 'Error.'}]); } finally { setIsChatLoading(false); }
              }} className="p-3 border-t border-app-border bg-app-panel">
                  <input className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm text-white focus:border-brand-primary outline-none" placeholder="Ask AI..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
              </form>
          </div>
      )}
    </div>
  );
};

// --- Sub-Component: Page Card ---
interface PageCardProps {
    page: NotePage;
    index: number;
    total: number;
    onUpdate: (field: keyof NotePage, val: string) => void;
    onDelete: () => void;
    onExport: (page: NotePage, format: 'txt' | 'pdf') => void;
    lang: Language;
    isDragging: boolean;
    onDragStart: (e: React.DragEvent, index: number) => void;
    onDragOver: (e: React.DragEvent, index: number) => void;
    onDrop: (e: React.DragEvent, index: number) => void;
    readMode: boolean;
}

const PageCard: React.FC<PageCardProps> = ({ 
    page, index, total, onUpdate, onDelete, onExport, lang,
    isDragging, onDragStart, onDragOver, onDrop, readMode
}) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <div 
            draggable={!readMode}
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDrop={(e) => onDrop(e, index)}
            className={`
                relative bg-app-bg rounded-xl transition-all duration-300
                ${isDragging ? 'opacity-40 scale-95' : 'shadow-lg hover:shadow-xl'}
                ${readMode ? '' : 'border border-app-border hover:border-brand-primary/30'}
            `}
        >
            {/* Header / Controls */}
            {!readMode && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-app-border bg-app-surface rounded-t-xl select-none group">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="cursor-grab active:cursor-grabbing text-brand-muted hover:text-white p-1">
                            <GripVertical size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-app-bg px-2 py-0.5 rounded border border-app-border">
                            {index + 1}
                        </span>
                        <input 
                            type="text" 
                            value={page.title}
                            onChange={(e) => onUpdate('title', e.target.value)}
                            className="bg-transparent text-xs font-semibold text-brand-muted focus:text-white outline-none w-full max-w-[150px] transition-colors"
                        />
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-brand-muted hover:text-white rounded hover:bg-app-hover">
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <div className="h-3 w-px bg-app-border mx-1" />
                        <button onClick={() => onExport(page, 'pdf')} className="p-1.5 text-brand-muted hover:text-white rounded hover:bg-app-hover" title="PDF">
                            <Download size={14} />
                        </button>
                        {total > 1 && (
                            <button onClick={onDelete} className="p-1.5 text-brand-muted hover:text-red-400 rounded hover:bg-red-900/20">
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Content "Paper" */}
            {expanded && (
                <div className={`
                    min-h-[400px] p-8 text-slate-200 text-lg leading-relaxed outline-none font-sans
                    ${readMode ? 'bg-app-bg rounded-xl border border-transparent' : 'bg-app-bg rounded-b-xl'}
                `}>
                    <div 
                        className="w-full h-full outline-none empty:before:content-[attr(placeholder)] empty:before:text-slate-600 space-y-4"
                        contentEditable={!readMode}
                        suppressContentEditableWarning
                        onInput={(e) => onUpdate('content', e.currentTarget.innerHTML)}
                        dangerouslySetInnerHTML={{ __html: page.content }}
                        placeholder={t('editor.placeholder', lang)}
                    />
                </div>
            )}
        </div>
    );
};
