import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { NoteList } from './components/NoteList';
import { Editor } from './components/Editor';
import { LogoMaker } from './components/LogoMaker';
import { VoiceAI } from './components/VoiceAI';
import { FileManager } from './components/FileManager';
import { ChatAI } from './components/ChatAI';
import { SystemCore } from './components/SystemCore';
import { DeveloperHub } from './components/DeveloperHub';
import { OfficeAI } from './components/OfficeAI';
import { SettingsModal } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';
import { ToastContainer } from './components/ToastContainer';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Note, Folder, User, Module, UpdatePackage, ModuleHealth, UserSettings } from './types';
import { StorageService } from './services/storage';
import { GeminiService } from './services/gemini';
import { VoiceCommand } from './services/voice';
import { SyncService } from './services/sync';
import { UpdaterService } from './services/updater';
import { SystemService } from './services/system';
import { Language, getDir, t } from './services/i18n';
import { 
  Plus, ShieldAlert, RefreshCw, NotebookPen, Aperture, Mic, 
  HardDrive, Sparkles, Cpu, Code, Settings, LogOut, Menu, AlertTriangle, X, Briefcase
} from 'lucide-react';
import { Button } from './components/Button';

type ViewState = 'nav' | 'list' | 'editor';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [lang, setLang] = useState<Language>('en'); 
  const [activeModule, setActiveModule] = useState<Module>('notes');
  const [activeViewId, setActiveViewId] = useState<string>('all'); 
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<ViewState>('nav');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [criticalUpdate, setCriticalUpdate] = useState<UpdatePackage | null>(null);
  const [isUpdatingCritical, setIsUpdatingCritical] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // UI Customization
  const [uiSettings, setUiSettings] = useState<Partial<UserSettings>>({ themeIntensity: 'medium', uiDensity: 'comfortable' });

  // Setup State
  const [showSetup, setShowSetup] = useState(false);

  // CMC Monitoring
  const [toolHealth, setToolHealth] = useState<Record<string, ModuleHealth>>({});
  const [alertModalOpen, setAlertModalOpen] = useState<ModuleHealth | null>(null);

  useEffect(() => {
    // 1. Check for First Run
    if (!StorageService.isSetupComplete()) {
        setShowSetup(true);
        return; 
    }

    // 2. Dev Seeding (only if setup is done but no user - edge case)
    if (!StorageService.getCurrentUser()) {
        const user = StorageService.dev_seedUser({ email: "user@example.com", fullName: "Majid", langPref: "en" });
        if (user) handleLogin(user);
    }
    
    // 3. Normal Boot
    const user = StorageService.getCurrentUser();
    const settings = StorageService.getSettings();
    setUiSettings({ themeIntensity: settings.themeIntensity, uiDensity: settings.uiDensity });

    if (user) {
        handleLogin(user);
    } else {
        setLang(settings.language || 'en');
    }
    
    SyncService.subscribe((event) => {
        if (event.type === 'UPDATE_AVAILABLE') {
            const pending = UpdaterService.getPendingUpdate();
            if (pending && pending.severity === 'critical') setCriticalUpdate(pending);
            return;
        }
        if (event.type === 'SETTINGS_UPDATE') {
             const s = StorageService.getSettings();
             setUiSettings({ themeIntensity: s.themeIntensity, uiDensity: s.uiDensity });
             setLang(s.language || 'en');
        }
        setIsSyncing(true);
        refreshData();
        setTimeout(() => setIsSyncing(false), 800);
    });
    UpdaterService.checkForUpdates(true).then(update => {
        if (update && update.severity === 'critical') setCriticalUpdate(update);
    });

    // CMC Monitoring Loop
    const healthCheckInterval = setInterval(() => {
        const status = SystemService.getModuleHealthStatus();
        setToolHealth(status);
    }, 10000); 

    return () => clearInterval(healthCheckInterval);
  }, []);

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setLang(user.langPref || 'en');
      refreshData();
      if (window.innerWidth > 768) setMobileView('editor'); 
  };

  const handleLogout = () => {
      StorageService.logout();
      setCurrentUser(null);
      setNotes([]);
      setFolders([]);
      setSelectedNoteId(null);
      setLang('en');
      setIsSettingsOpen(false); 
  };

  const handleSetupComplete = () => {
      setShowSetup(false);
      // Re-trigger auth check
      const user = StorageService.dev_seedUser({ email: "user@example.com", fullName: "Majid", langPref: "en" });
      if (user) handleLogin(user);
  };

  const refreshData = () => {
      setFolders(StorageService.getFolders());
      setNotes(StorageService.getNotes());
  };

  const handleChangeLang = (newLang: Language) => {
      setLang(newLang);
      StorageService.saveSettings({ language: newLang });
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.contentPlain.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeViewId === 'trash') return note.deletedAt !== null;
    if (note.deletedAt !== null) return false;
    if (activeViewId === 'all') return !note.isArchived;
    if (activeViewId === 'favorites') return note.isFavorite;
    if (activeViewId === 'archive') return note.isArchived;
    return note.folderId === activeViewId && !note.isArchived;
  });

  const handleCreateNote = async (initialContent?: string, initialTitle?: string) => {
    let targetFolder = activeViewId;
    if (['all', 'favorites', 'trash', 'archive'].includes(targetFolder)) targetFolder = 'root';
    const newNote = StorageService.createNote(targetFolder);
    if (initialContent || initialTitle) {
        const updates: Partial<Note> = {};
        if (initialContent) { updates.contentPlain = initialContent; updates.contentRich = initialContent; }
        if (initialTitle) { updates.title = initialTitle; }
        StorageService.updateNote(newNote.id, updates);
        Object.assign(newNote, updates);
    }
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    SyncService.broadcast('NOTE_UPDATE', newNote.id);
    if (window.innerWidth <= 768) setMobileView('editor');
    if (targetFolder === 'root' && newNote.contentPlain.length > 50) {
        setTimeout(async () => {
            const suggestedFolderId = await GeminiService.autoOrganize(newNote.contentPlain, folders);
            if (suggestedFolderId && suggestedFolderId !== 'None') handleUpdateNote(newNote.id, { folderId: suggestedFolderId });
        }, 10000);
    }
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    const updated = StorageService.updateNote(id, updates);
    setNotes(prev => prev.map(n => n.id === id ? updated : n));
    SyncService.broadcast('NOTE_UPDATE', id);
  };

  const handleDeleteNote = (id: string) => {
    if (activeViewId === 'trash') {
        if(confirm("Permanently delete?")) {
            StorageService.permanentDeleteNote(id);
            setNotes(prev => prev.filter(n => n.id !== id));
            setSelectedNoteId(null);
            SyncService.broadcast('NOTE_UPDATE', id);
            if(window.innerWidth <= 768) setMobileView('list');
        }
    } else {
        StorageService.softDeleteNote(id);
        setNotes(prev => prev.map(n => n.id === id ? { ...n, deletedAt: Date.now() } : n));
        SyncService.broadcast('NOTE_UPDATE', id);
        if (selectedNoteId === id) setSelectedNoteId(null);
        if(window.innerWidth <= 768) setMobileView('list');
    }
  };

  const handleToolAction = (action: string, payload: any) => {
      if (action === 'create_note') {
          setActiveModule('notes');
          handleCreateNote(payload.content, payload.title);
      } else if (action === 'design_brand') {
          setActiveModule('logos');
      } else if (action === 'search_content') {
          setActiveModule('notes');
          setSearchQuery(payload.query);
      }
  };

  const handleVoiceExecution = (cmd: VoiceCommand) => {
      switch(cmd.action) {
          case 'NAVIGATE':
              if (cmd.payload.view) {
                  const view = cmd.payload.view.toLowerCase();
                  if (view.includes('fav')) setActiveViewId('favorites');
                  else if (view.includes('trash') || view.includes('bin')) setActiveViewId('trash');
                  else if (view.includes('archive')) setActiveViewId('archive');
                  else if (view.includes('setting')) setIsSettingsOpen(true);
                  else setActiveViewId('all');
                  setActiveModule('notes');
                  if (window.innerWidth <= 768) setMobileView('list');
              }
              break;
          case 'SWITCH_MODULE':
              if (cmd.payload.module) setActiveModule(cmd.payload.module);
              break;
          case 'SEARCH':
              if (cmd.payload.query) {
                  setActiveModule('notes');
                  setSearchQuery(cmd.payload.query);
                  if (window.innerWidth <= 768) setMobileView('list');
              }
              break;
          case 'CREATE_NOTE':
              setActiveModule('notes');
              handleCreateNote(cmd.payload.content, cmd.payload.title);
              break;
      }
  };

  const handleForceUpdate = async () => {
      if (!criticalUpdate) return;
      setIsUpdatingCritical(true);
      await UpdaterService.downloadUpdate(criticalUpdate, () => {});
      await UpdaterService.applyUpdate(criticalUpdate);
      setIsUpdatingCritical(false);
      setCriticalUpdate(null);
      window.location.reload();
  };

  const resolveToolIssue = (moduleId: string) => {
      setToolHealth(prev => {
          const newState = { ...prev };
          delete newState[moduleId];
          return newState;
      });
      setAlertModalOpen(null);
  };

  const selectedNote = notes.find(n => n.id === selectedNoteId);
  const getViewTitle = () => {
    if (activeViewId === 'all') return t('nav.allNotes', lang);
    if (activeViewId === 'favorites') return t('nav.favorites', lang);
    if (activeViewId === 'trash') return t('nav.trash', lang);
    if (activeViewId === 'archive') return t('nav.archive', lang);
    const folder = folders.find(f => f.id === activeViewId);
    return folder ? folder.name : t('nav.allNotes', lang);
  };

  // UX: THEME ENGINE
  // Using new semantic classes
  const densityGap = uiSettings.uiDensity === 'compact' ? 'gap-1 p-1' : 'gap-3 p-3';
  const windowBase = `bg-app-panel rounded-2xl overflow-hidden shadow-2xl relative transition-all duration-300 border border-app-border`;

  const TopBarButton = ({ id, icon, label }: { id: Module, icon: React.ReactNode, label: string }) => {
      const health = toolHealth[id];
      const isError = health?.status === 'error';
      const isWarning = health?.status === 'warning';
      
      const isActive = activeModule === id;

      return (
        <button 
            onClick={() => setActiveModule(id)} 
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all relative group h-full min-w-[80px]
                ${isActive 
                    ? 'text-brand-primary bg-brand-primary/10' 
                    : 'text-brand-muted hover:text-white hover:bg-app-hover'}
                btn-click-effect
            `}
            title={isError ? `Error: ${health.issue}` : label}
        >
            <div className={`transition-transform duration-300 relative ${isActive ? 'scale-110' : ''}`}>
                {icon}
                {(isError || isWarning) && (
                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            setAlertModalOpen(health);
                        }}
                        className={`absolute -top-1 -right-1 p-0.5 rounded-full bg-app-bg shadow-sm cursor-pointer z-10 hover:scale-125 transition-transform animate-pulse ${isError ? 'text-red-500' : 'text-[#F5A623]'}`}
                    >
                        <AlertTriangle size={10} fill="currentColor" strokeWidth={1} />
                    </div>
                )}
            </div>
            <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-brand-primary' : 'text-brand-muted group-hover:text-white'}`}>{label}</span>
            {isActive && <div className="absolute bottom-0 w-1/2 h-0.5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(0,85,204,0.8)]" />}
        </button>
      );
  };

  const dir = getDir(lang);

  // --- SHOW SETUP WIZARD IF NEEDED ---
  if (showSetup) {
      return <OnboardingWizard onComplete={handleSetupComplete} />;
  }

  if (!currentUser) {
      return <AuthScreen onLogin={handleLogin} lang={lang} setLang={handleChangeLang} />;
  }

  return (
    <div className={`flex flex-col h-screen w-full bg-app-bg text-brand-text overflow-hidden relative ${lang === 'fa' ? 'font-vazir' : 'font-sans'}`} dir={dir}>
      <ToastContainer />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentLang={lang} 
        onChangeLang={handleChangeLang} 
        onLogout={handleLogout}
        settings={uiSettings}
        onUpdateSettings={(s) => {
            StorageService.saveSettings(s);
            SyncService.broadcast('SETTINGS_UPDATE');
        }}
      />
      
      {/* Alert Modal */}
      {alertModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95" role="dialog">
              <div className="bg-app-panel border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                  <div className="p-4 bg-red-900/10 border-b border-red-500/20 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-red-400 font-bold">
                          <AlertTriangle size={20} />
                          {t('app.cmcAlert', lang)}: {t(`module.${alertModalOpen.moduleId}`, lang)}
                      </div>
                      <button onClick={() => setAlertModalOpen(null)} className="text-brand-muted hover:text-white"><X size={20}/></button>
                  </div>
                  <div className="p-6">
                      <p className="text-brand-muted text-sm mb-4">{alertModalOpen.issue}</p>
                      <div className="bg-app-bg p-3 rounded-lg border border-app-border text-xs font-mono text-brand-muted mb-6">
                          {t('app.recAction', lang)}: {alertModalOpen.fixAction}
                      </div>
                      <div className="flex gap-3">
                          <Button variant="secondary" onClick={() => setAlertModalOpen(null)} className="flex-1">{t('app.ignore', lang)}</Button>
                          <Button 
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white" 
                            icon={<RefreshCw size={16} />}
                            onClick={() => resolveToolIssue(alertModalOpen.moduleId)}
                          >
                              {t('app.applyFix', lang)}
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- TOP PANEL (Updated for ParSam Studio) --- */}
      <div className="w-full h-20 bg-app-bg border-b border-app-border flex items-center justify-between px-6 shrink-0 z-50 sticky top-0 shadow-sm">
          
          {/* Main Title & Brand */}
          <div className="flex flex-col gap-1 group cursor-default">
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:rotate-6 transition-transform duration-300">
                    <span className="font-extrabold text-white text-xl leading-none">P</span>
                </div>
                <div className="flex flex-col justify-center h-9">
                    <span className="font-bold text-xl text-white tracking-tight leading-none group-hover:text-brand-primary transition-colors">ParSam Studio</span>
                </div>
             </div>
          </div>

          {/* Horizontal Tool Icons (Flow Style) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mx-4 h-full" role="toolbar">
              <TopBarButton id="notes" icon={<NotebookPen size={22} strokeWidth={1.5} />} label={t('module.notes', lang)} />
              <TopBarButton id="logos" icon={<Aperture size={22} strokeWidth={1.5} />} label={t('module.logos', lang)} />
              <TopBarButton id="voice" icon={<Mic size={22} strokeWidth={1.5} />} label={t('module.voice', lang)} />
              <TopBarButton id="drive" icon={<HardDrive size={22} strokeWidth={1.5} />} label={t('module.drive', lang)} />
              <TopBarButton id="chat" icon={<Sparkles size={22} strokeWidth={1.5} />} label={t('module.chat', lang)} />
              <TopBarButton id="office" icon={<Briefcase size={22} strokeWidth={1.5} />} label={t('module.office', lang)} />
              <TopBarButton id="system" icon={<Cpu size={22} strokeWidth={1.5} />} label={t('module.system', lang)} />
              <TopBarButton id="dev" icon={<Code size={22} strokeWidth={1.5} />} label={t('module.dev', lang)} />
          </div>

          {/* Global Actions */}
          <div className="flex items-center gap-3 pl-4 border-l border-app-border">
              <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 rounded-full hover:bg-app-hover text-brand-muted hover:text-white transition-colors btn-click-effect relative" title={t('nav.settings', lang)}>
                  <Settings size={20} strokeWidth={1.5} />
              </button>
              <button onClick={handleLogout} className="p-2.5 rounded-full hover:bg-red-900/20 text-brand-muted hover:text-red-400 transition-colors md:hidden btn-click-effect">
                  <LogOut size={20} strokeWidth={1.5} />
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 rounded-full hover:bg-app-hover text-brand-muted md:hidden btn-click-effect">
                  <Menu size={20} strokeWidth={1.5} />
              </button>
          </div>
      </div>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className={`flex-1 flex overflow-hidden ${densityGap} relative`}>
          
          {/* Background Ambient Glow - Darker for new theme */}
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-primary/5 rounded-full blur-[150px] pointer-events-none z-0" />
          
          {criticalUpdate && (
              <div className="absolute inset-0 z-[1000] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
                 <div className="max-w-md w-full bg-app-panel border border-red-500/50 rounded-2xl p-8 shadow-2xl shadow-red-900/50 text-center animate-enter">
                     <ShieldAlert size={40} className="text-red-500 animate-pulse mx-auto mb-6" />
                     <h2 className="text-2xl font-bold text-white mb-2">{t('app.criticalUpdate', lang)}</h2>
                     <Button onClick={handleForceUpdate} className="w-full bg-red-600 hover:bg-red-500 mt-6" loading={isUpdatingCritical}>{t('app.installNow', lang)}</Button>
                 </div>
              </div>
          )}
          
          {isSyncing && (
              <div className="absolute bottom-6 right-6 z-50 bg-app-panel/90 border border-green-500/50 rounded-lg px-4 py-2 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in backdrop-blur-md">
                 <RefreshCw size={14} className="text-green-400 animate-spin" />
                 <span className="text-xs font-medium text-slate-200">{t('app.syncing', lang)}</span>
              </div>
          )}

          {/* Sidebar (Notes Only) */}
          {activeModule === 'notes' && (
            <div className={`
                ${windowBase} z-30 flex-shrink-0 flex flex-col animate-enter
                ${mobileMenuOpen ? 'w-64 absolute left-2 top-2 bottom-2 border border-app-border' : 'hidden md:flex md:w-64'}
            `}>
                <Navigation 
                    folders={folders}
                    activeView={activeViewId}
                    onNavigate={(view) => { setActiveViewId(view); if (window.innerWidth <= 768) { setMobileView('list'); setMobileMenuOpen(false); } }}
                    onCreateFolder={(name) => { setFolders([...folders, StorageService.createFolder(name)]); SyncService.broadcast('SETTINGS_UPDATE'); }}
                    onDeleteFolder={(id) => { StorageService.deleteFolder(id); setFolders(folders.filter(f => f.id !== id)); if (activeViewId === id) setActiveViewId('all'); SyncService.broadcast('SETTINGS_UPDATE'); }}
                    lang={lang}
                    onChangeLang={handleChangeLang}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onLogout={handleLogout}
                />
            </div>
          )}

          {/* Main Module Area */}
          {activeModule !== 'notes' ? (
              <div className={`${windowBase} flex-1 z-20 flex flex-col animate-enter bg-app-panel overflow-hidden`}>
                 {activeModule === 'logos' && <LogoMaker lang={lang} onChangeLang={handleChangeLang} onLogout={handleLogout} />}
                 {activeModule === 'voice' && <VoiceAI lang={lang} onExecuteCommand={handleVoiceExecution} onClose={() => setActiveModule('notes')} />}
                 {activeModule === 'drive' && <FileManager lang={lang} />}
                 {activeModule === 'chat' && <ChatAI lang={lang} onExecuteAction={handleToolAction} />}
                 {activeModule === 'office' && <OfficeAI lang={lang} />}
                 {activeModule === 'system' && <SystemCore lang={lang} />}
                 {activeModule === 'dev' && <DeveloperHub lang={lang} />}
              </div>
          ) : (
            <>
                {/* Notes List */}
                <div className={`
                    ${windowBase} z-20 flex-col animate-enter bg-app-panel border-r border-app-border
                    ${mobileView === 'list' && !mobileMenuOpen ? 'w-full absolute inset-0 flex' : 'hidden md:flex md:w-80'}
                `}>
                    <NoteList 
                        notes={filteredNotes}
                        selectedNoteId={selectedNoteId}
                        onSelectNote={(id) => { setSelectedNoteId(id); if (window.innerWidth <= 768) setMobileView('editor'); }}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        viewTitle={getViewTitle()}
                        onBack={() => setMobileMenuOpen(true)}
                        lang={lang}
                    />
                    <div className={`absolute bottom-6 md:hidden ${lang === 'fa' ? 'left-6' : 'right-6'}`}>
                        <button onClick={() => handleCreateNote()} className="w-14 h-14 bg-brand-primary rounded-full flex items-center justify-center text-white shadow-xl shadow-brand-primary/30 btn-click-effect">
                            <Plus size={24} />
                        </button>
                    </div>
                </div>

                {/* Editor */}
                <div className={`
                    ${windowBase} z-10 flex-1 flex-col animate-enter bg-app-panel
                    ${mobileView === 'editor' ? 'w-full absolute inset-0 flex' : 'hidden md:flex'}
                `}>
                    {selectedNote ? (
                        <>
                            <div className="md:hidden h-12 flex items-center px-4 border-b border-app-border bg-app-panel backdrop-blur-md">
                                <button onClick={() => setMobileView('list')} className={`text-brand-muted ${lang === 'fa' ? 'ml-4' : 'mr-4'}`}>Back</button>
                                <span className="font-semibold text-sm truncate">{selectedNote.title}</span>
                            </div>
                            <Editor 
                                key={selectedNote.id}
                                note={selectedNote}
                                onUpdate={(updates) => handleUpdateNote(selectedNote.id, updates)}
                                onDelete={() => handleDeleteNote(selectedNote.id)}
                                isTrash={activeViewId === 'trash'}
                                lang={lang}
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-brand-muted">
                            <div className="w-20 h-20 bg-app-surface rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-app-border">
                                 <Plus size={32} className="opacity-20" />
                            </div>
                            <p className="text-sm font-medium opacity-70">Select a note or create a new one.</p>
                            <Button onClick={() => handleCreateNote()} className="mt-6" variant="primary">Create Note</Button>
                        </div>
                    )}
                </div>
            </>
          )}
      </div>
    </div>
  );
};

export default App;