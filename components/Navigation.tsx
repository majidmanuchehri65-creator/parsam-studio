
import React, { useState } from 'react';
import { Folder } from '../types';
import { Language, t, getDir } from '../services/i18n';
import { 
  Folder as FolderIcon, Plus, Trash2, Inbox, Star, 
  ChevronRight, ChevronDown, ChevronLeft, Briefcase, Lightbulb, User, Archive
} from 'lucide-react';

interface NavigationProps {
  folders: Folder[];
  activeView: string;
  onNavigate: (view: string) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  folders, activeView, onNavigate, onCreateFolder, onDeleteFolder, lang
}) => {
  const [showFolders, setShowFolders] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const iconSize = 18;
  const iconStroke = 2;

  const getFolderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'work': return <Briefcase size={iconSize} strokeWidth={iconStroke} className="text-slate-400" />;
      case 'ideas': return <Lightbulb size={iconSize} strokeWidth={iconStroke} className="text-yellow-500/80" />;
      case 'personal': return <User size={iconSize} strokeWidth={iconStroke} className="text-blue-400" />;
      default: return <FolderIcon size={iconSize} strokeWidth={iconStroke} className="text-slate-400" />;
    }
  };

  const ChevronExpanded = showFolders ? ChevronDown : (lang === 'fa' ? ChevronLeft : ChevronRight);

  const NavItem = ({ id, icon, label, count }: { id: string, icon: React.ReactNode, label: string, count?: number }) => (
    <button
      onClick={() => onNavigate(id)}
      className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group
        ${activeView === id 
          ? 'bg-parsam-600/10 text-parsam-400 font-bold border border-parsam-500/20' 
          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent font-medium'
        }`}
    >
      <span className={`transition-transform duration-300 ${activeView === id ? 'scale-110 drop-shadow-md' : 'group-hover:scale-105'}`}>{icon}</span>
      <span className="flex-1 text-start tracking-tight">{label}</span>
      {count !== undefined && <span className="text-xs opacity-50 bg-slate-800 px-2 py-0.5 rounded-full">{count}</span>}
    </button>
  );

  const dir = getDir(lang);

  return (
    <div className="flex flex-col h-full p-4 select-none overflow-y-auto" dir={dir}>
      {/* Navigation Content (Folders, etc.) */}
      <div className="space-y-6 flex-1">
          <div className="space-y-1">
              <NavItem id="all" icon={<Inbox size={iconSize} strokeWidth={iconStroke} />} label={t('nav.allNotes', lang)} />
              <NavItem id="favorites" icon={<Star size={iconSize} strokeWidth={iconStroke} />} label={t('nav.favorites', lang)} />
              <NavItem id="archive" icon={<Archive size={iconSize} strokeWidth={iconStroke} className="opacity-80"/>} label={t('nav.archive', lang)} />
          </div>

          <div>
              <div className="px-2 mb-2 flex items-center justify-between group cursor-pointer" onClick={() => setShowFolders(!showFolders)}>
                  <span 
                      className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 hover:text-slate-300 transition-colors"
                  >
                      <ChevronExpanded size={14} strokeWidth={2.5} />
                      {t('nav.folders', lang)}
                  </span>
                  <button 
                      onClick={(e) => { e.stopPropagation(); setIsCreatingFolder(true); }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-parsam-400 transition-all p-1 hover:bg-white/5 rounded"
                      title={t('nav.newFolder', lang)}
                  >
                      <Plus size={16} strokeWidth={2.5} />
                  </button>
              </div>

              <div className={`space-y-1 transition-all duration-300 overflow-hidden ${showFolders ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  {folders.map(folder => (
                      <div key={folder.id} className="group relative">
                          <NavItem 
                              id={folder.id} 
                              icon={getFolderIcon(folder.name)} 
                              label={folder.name} 
                          />
                          {folder.type === 'user' && (
                          <button 
                              onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                              className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-2 transition-all ${lang === 'fa' ? 'left-2' : 'right-2'}`}
                          >
                              <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                          )}
                      </div>
                  ))}
                  
                  {isCreatingFolder && (
                      <form onSubmit={handleCreateSubmit} className="px-2 mt-2 animate-enter">
                      <input
                          autoFocus
                          type="text"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          onBlur={() => setIsCreatingFolder(false)}
                          placeholder={t('nav.newFolder', lang)}
                          className="w-full bg-slate-900/50 border border-parsam-500/50 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-parsam-500/20 outline-none shadow-lg"
                      />
                      </form>
                  )}
              </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-slate-800/50">
               <NavItem id="trash" icon={<Trash2 size={iconSize} strokeWidth={iconStroke} />} label={t('nav.trash', lang)} />
          </div>
      </div>
    </div>
  );
};
