
import React, { useState, useMemo } from 'react';
import { Note } from '../types';
import { Search, BrainCircuit, Star, Lock, Paperclip, ArrowLeft, ArrowRight, MoreVertical } from 'lucide-react';
import { Language, t, getDir } from '../services/i18n';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewTitle: string;
  onBack?: () => void;
  lang: Language;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  searchQuery,
  setSearchQuery,
  viewTitle,
  onBack,
  lang
}) => {
  const [isSemantic, setIsSemantic] = useState(false);
  const dir = getDir(lang);
  const BackIcon = lang === 'fa' ? ArrowRight : ArrowLeft;

  // Group notes by date sections
  const groupedNotes = useMemo(() => {
    const groups: { label: string; notes: Note[] }[] = [
      { label: t('list.today', lang) || 'Today', notes: [] },
      { label: t('list.yesterday', lang) || 'Yesterday', notes: [] },
      { label: t('list.last7days', lang) || 'Last 7 Days', notes: [] },
      { label: t('list.older', lang) || 'Older', notes: [] }
    ];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const lastWeekStart = todayStart - (86400000 * 7);

    notes.forEach(note => {
      if (note.updatedAt >= todayStart) groups[0].notes.push(note);
      else if (note.updatedAt >= yesterdayStart) groups[1].notes.push(note);
      else if (note.updatedAt >= lastWeekStart) groups[2].notes.push(note);
      else groups[3].notes.push(note);
    });

    return groups.filter(g => g.notes.length > 0);
  }, [notes, lang]);

  return (
    <div className="flex flex-col h-full bg-app-panel border-r border-app-border" dir={dir}>
      {/* Header */}
      <div className="px-5 pt-6 pb-2 shrink-0 z-10 bg-app-panel">
        <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                {onBack && (
                    <button onClick={onBack} className="md:hidden text-brand-muted hover:text-white p-1 -ml-1">
                        <BackIcon size={24} />
                    </button>
                )}
                <h2 className="text-3xl font-bold text-white tracking-tight">{viewTitle}</h2>
                <span className="text-sm text-brand-muted font-medium translate-y-1">({notes.length})</span>
            </div>
            <button className="text-brand-muted hover:text-white">
                <MoreVertical size={20} />
            </button>
        </div>
        
        {/* Floating Pill Search Bar */}
        <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className={`text-brand-muted ${lang === 'fa' ? 'right-4 left-auto' : 'left-4 right-auto'}`} />
            </div>
            <input 
                type="text"
                placeholder={isSemantic ? (lang === 'fa' ? 'جستجوی هوشمند...' : 'Smart Search...') : t('list.search', lang)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-app-bg border border-app-border rounded-full py-3.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-brand-primary/30 transition-all outline-none ${lang === 'fa' ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
            />
            <button 
                onClick={() => setIsSemantic(!isSemantic)}
                className={`absolute inset-y-1 right-1 p-2 rounded-full transition-all ${lang === 'fa' ? 'left-1 right-auto' : 'right-1 left-auto'} ${isSemantic ? 'bg-brand-primary/20 text-brand-primary' : 'text-brand-muted hover:bg-app-hover'}`}
                title="Toggle AI Search"
            >
                <BrainCircuit size={18} />
            </button>
        </div>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 custom-scrollbar space-y-6">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-brand-muted space-y-4">
            <div className="w-20 h-20 bg-app-surface rounded-full flex items-center justify-center opacity-50 border border-app-border">
                <Search size={32} />
             </div>
            <p className="text-sm font-medium">{t('list.noNotes', lang)}</p>
          </div>
        ) : (
          groupedNotes.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h3 className="text-xs font-bold text-brand-muted px-2 uppercase tracking-wider sticky top-0 bg-app-panel/95 py-2 backdrop-blur-sm z-10">
                {group.label}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {group.notes.map(note => (
                  <div 
                    key={note.id}
                    onClick={() => onSelectNote(note.id)}
                    className={`
                      group relative p-5 rounded-2xl cursor-pointer transition-all duration-200 border
                      ${selectedNoteId === note.id 
                        ? 'bg-app-surface border-brand-primary/50 shadow-md' 
                        : 'bg-app-bg border-transparent hover:border-app-border hover:bg-app-hover'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-bold text-base truncate pr-4 ${selectedNoteId === note.id ? 'text-white' : 'text-slate-200'}`}>
                          {note.title || t('list.untitled', lang)}
                      </h4>
                      {note.isFavorite && (
                          <Star size={14} className="text-amber-400 fill-amber-400 shrink-0 mt-1" />
                      )}
                    </div>
                    
                    <p className="text-xs text-brand-muted leading-relaxed line-clamp-2 mb-3 h-8 font-medium">
                      {note.isEncrypted ? '••••••••••••••••' : (note.contentPlain || 'No content')}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-app-border/50">
                       <span className="text-[10px] text-brand-muted font-medium">
                          {new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                       <div className="flex items-center gap-2 text-brand-muted">
                          {note.isEncrypted && <Lock size={12} />}
                          {note.attachments.length > 0 && <Paperclip size={12} />}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
