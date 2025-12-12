import React, { useState, useEffect } from 'react';
import { Note, NoteVersion } from '../types';
import { StorageService } from '../services/storage';
import { Language, t, getDir } from '../services/i18n';
import { X, History, Clock, Smartphone, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface HistoryModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  onRestore: () => void;
  lang: Language;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ note, isOpen, onClose, onRestore, lang }) => {
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);

  useEffect(() => {
    if (isOpen) {
        const h = StorageService.getNoteVersions(note.id);
        setVersions(h);
        if (h.length > 0) setSelectedVersion(h[0]);
    }
  }, [isOpen, note.id]);

  const handleRestore = () => {
      if (selectedVersion) {
          if (confirm("Restore this version? A snapshot of the current state will be saved.")) {
              StorageService.restoreVersion(note.id, selectedVersion.id);
              onRestore();
              onClose();
          }
      }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString(lang === 'fa' ? 'fa-IR' : (lang === 'de' ? 'de-DE' : 'en-US'));
  };

  if (!isOpen) return null;

  const dir = getDir(lang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div 
        dir={dir}
        className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <History className="text-parsam-500" size={20} />
            {t('history.title', lang)}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar List */}
            <div className={`w-1/3 bg-slate-950 border-slate-800 overflow-y-auto ${lang === 'fa' ? 'border-l' : 'border-r'}`}>
                {versions.map((v, idx) => (
                    <button
                        key={v.id}
                        onClick={() => setSelectedVersion(v)}
                        className={`w-full text-start p-4 border-b border-slate-800/50 hover:bg-slate-900 transition-colors flex flex-col gap-1
                            ${selectedVersion?.id === v.id ? 'bg-slate-900 border-l-4 border-l-parsam-500' : ''}
                        `}
                    >
                        <div className="flex justify-between items-center w-full">
                            <span className="font-mono text-xs text-parsam-400 font-bold">v{v.versionNumber}.0</span>
                            {idx === 0 && <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 rounded uppercase tracking-wider">{t('history.current', lang)}</span>}
                        </div>
                        <div className="text-sm text-slate-200 font-medium">
                            {formatTime(v.createdAt)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <Smartphone size={12} />
                            {v.createdByDevice}
                        </div>
                    </button>
                ))}
            </div>

            {/* Preview Pane */}
            <div className="flex-1 bg-slate-900 p-8 overflow-y-auto flex flex-col">
                {selectedVersion ? (
                    <>
                        <div className="mb-6 p-4 bg-yellow-900/10 border border-yellow-700/30 rounded-lg flex items-start gap-3 text-yellow-200/80 text-sm">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p>You are viewing a historical snapshot from {formatTime(selectedVersion.createdAt)}. <br/>Restoring this will overwrite current content.</p>
                        </div>
                        
                        <div 
                            className="prose prose-invert max-w-none text-slate-300"
                            dangerouslySetInnerHTML={{ __html: selectedVersion.contentSnapshot }}
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        Select a version to preview
                    </div>
                )}
            </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>{t('settings.close', lang)}</Button>
            <Button 
                variant="primary" 
                onClick={handleRestore} 
                disabled={!selectedVersion}
                icon={<RotateCcw size={16} />}
            >
                {t('history.restore', lang)}
            </Button>
        </div>
      </div>
    </div>
  );
};