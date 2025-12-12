import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Globe, Server, Save, Download, Database, Smartphone, Laptop, Monitor, Key, Plus, Copy, AlertTriangle, Trash2, Code, Upload, LogOut, Sliders, LayoutTemplate } from 'lucide-react';
import { Language, t, getDir } from '../services/i18n';
import { StorageService } from '../services/storage';
import { DeviceSession, ApiClient, UserSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onChangeLang: (lang: Language) => void;
  onLogout: () => void;
  settings?: Partial<UserSettings>;
  onUpdateSettings?: (s: Partial<UserSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currentLang, 
  onChangeLang,
  onLogout,
  settings,
  onUpdateSettings
}) => {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [apiClients, setApiClients] = useState<ApiClient[]>([]);
  
  // New Client State
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [generatedSecret, setGeneratedSecret] = useState<{id: string, secret: string} | null>(null);

  useEffect(() => {
      if (isOpen) {
          refreshData();
      }
  }, [isOpen]);

  const refreshData = () => {
      setSessions(StorageService.getUserSessions());
      setApiClients(StorageService.getApiClients());
  };

  const handleRevoke = (id: string) => {
      StorageService.revokeSession(id);
      refreshData();
  };

  const handleRevokeClient = (id: string) => {
      if(confirm("Revoke this API Key? Any application using it will lose access immediately.")) {
          StorageService.revokeApiClient(id);
          refreshData();
      }
  };

  const handleCreateClient = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newClientName.trim()) return;

      const result = StorageService.createApiClient(newClientName);
      setGeneratedSecret({ id: result.client.id, secret: result.rawSecret });
      setNewClientName('');
      setIsCreatingClient(false);
      refreshData();
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
  };

  if (!isOpen) return null;

  const dir = getDir(currentLang);

  const getDeviceIcon = (name: string) => {
      if (name.includes('iPhone') || name.includes('Android')) return <Smartphone size={16} />;
      if (name.includes('Mac') || name.includes('Windows')) return <Laptop size={16} />;
      return <Monitor size={16} />;
  };

  const formatTime = (ts: number) => {
      return new Date(ts).toLocaleString(currentLang === 'fa' ? 'fa-IR' : (currentLang === 'de' ? 'de-DE' : 'en-US'));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-enter">
      <div 
        dir={dir}
        className="bg-app-panel border border-app-border w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-app-border bg-app-surface">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="text-brand-primary" size={20} />
            {t('settings.title', currentLang)}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-brand-muted hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">
                <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar bg-app-panel">
          {/* Language Section */}
          <div>
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3 block flex items-center gap-2">
              <Globe size={14} /> {t('settings.language', currentLang)}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['en', 'de', 'fa'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onChangeLang(lang)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                    currentLang === lang
                      ? 'bg-brand-primary border-brand-primary text-white shadow-lg'
                      : 'bg-app-surface border-app-border text-brand-muted hover:bg-app-hover'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'de' ? 'Deutsch' : 'فارسی'}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-app-border" />

          {/* Theme & Density */}
          {settings && onUpdateSettings && (
              <div>
                  <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3 block flex items-center gap-2">
                      <Sliders size={14} /> {t('settings.interface', currentLang)}
                  </label>
                  <div className="space-y-4">
                      <div>
                          <div className="flex justify-between text-xs text-brand-muted mb-2">
                              <span>{t('settings.glass', currentLang)}</span>
                              <span className="text-slate-200 capitalize">{settings.themeIntensity || 'medium'}</span>
                          </div>
                          <div className="flex gap-2">
                              {['low', 'medium', 'high'].map((intensity) => (
                                  <button
                                      key={intensity}
                                      onClick={() => onUpdateSettings({ themeIntensity: intensity as any })}
                                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                                          settings.themeIntensity === intensity 
                                          ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' 
                                          : 'bg-app-surface border-app-border text-brand-muted hover:bg-app-hover'
                                      }`}
                                  >
                                      {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs text-brand-muted mb-2">
                              <span>{t('settings.density', currentLang)}</span>
                              <span className="text-slate-200 capitalize">{settings.uiDensity || 'comfortable'}</span>
                          </div>
                          <div className="flex gap-2">
                              {['compact', 'comfortable'].map((density) => (
                                  <button
                                      key={density}
                                      onClick={() => onUpdateSettings({ uiDensity: density as any })}
                                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                                          settings.uiDensity === density 
                                          ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' 
                                          : 'bg-app-surface border-app-border text-brand-muted hover:bg-app-hover'
                                      }`}
                                  >
                                      {density.charAt(0).toUpperCase() + density.slice(1)}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          )}

          <div className="w-full h-px bg-app-border" />

          {/* Active Devices */}
          <div>
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3 block flex items-center gap-2">
              <Laptop size={14} /> {t('settings.devices', currentLang)}
            </label>
            <div className="space-y-2">
                {sessions.map(session => {
                    const isCurrent = StorageService.isCurrentSession(session.id);
                    return (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-app-surface border border-app-border rounded-lg hover:border-brand-primary/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${isCurrent ? 'bg-green-500/20 text-green-400' : 'bg-app-bg text-brand-muted'}`}>
                                    {getDeviceIcon(session.deviceName)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-200">{session.deviceName}</span>
                                        {isCurrent && <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 rounded border border-green-900/50">{t('settings.currentDevice', currentLang)}</span>}
                                    </div>
                                    <div className="text-[10px] text-brand-muted flex flex-col">
                                        <span>{t('settings.lastSeen', currentLang)}: {formatTime(session.lastSeen)}</span>
                                        <span className="font-mono opacity-50 text-[9px] mt-0.5">ID: {session.id.substring(0,8)}</span>
                                    </div>
                                </div>
                            </div>
                            {!isCurrent && (
                                <button 
                                    onClick={() => handleRevoke(session.id)}
                                    className="text-xs text-red-400 hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                                >
                                    {t('settings.revoke', currentLang)}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
          </div>

          <div className="w-full h-px bg-app-border" />

          {/* API Keys */}
          <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider block flex items-center gap-2">
                    <Key size={14} /> {t('settings.apiKeys', currentLang)}
                </label>
                <button 
                    onClick={() => setIsCreatingClient(true)}
                    className="text-[10px] flex items-center gap-1 bg-app-surface hover:bg-brand-primary hover:text-white px-2 py-1 rounded text-brand-muted transition-colors border border-app-border"
                >
                    <Plus size={12} /> {t('settings.generateKey', currentLang)}
                </button>
              </div>

              {/* Secret Reveal UI */}
              {generatedSecret && (
                  <div className="mb-4 bg-yellow-900/10 border border-yellow-700/50 rounded-lg p-4 animate-enter">
                      <div className="flex items-start gap-2 text-yellow-500 mb-2">
                          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                          <span className="text-xs font-bold">{t('settings.secretWarning', currentLang)}</span>
                      </div>
                      <div className="space-y-2">
                          <div className="bg-app-bg p-2 rounded border border-app-border flex justify-between items-center group">
                              <code className="text-xs text-brand-muted font-mono">Client ID: {generatedSecret.id}</code>
                              <button onClick={() => copyToClipboard(generatedSecret.id)} className="text-brand-muted hover:text-white"><Copy size={12}/></button>
                          </div>
                          <div className="bg-app-bg p-2 rounded border border-app-border flex justify-between items-center group">
                              <code className="text-xs text-green-400 font-mono break-all">{generatedSecret.secret}</code>
                              <button onClick={() => copyToClipboard(generatedSecret.secret)} className="text-brand-muted hover:text-white"><Copy size={12}/></button>
                          </div>
                      </div>
                      <button onClick={() => setGeneratedSecret(null)} className="w-full mt-3 text-xs bg-app-surface hover:bg-app-hover py-1.5 rounded text-slate-300">
                          {t('settings.copied', currentLang)}
                      </button>
                  </div>
              )}

              {/* Create Form */}
              {isCreatingClient && (
                  <form onSubmit={handleCreateClient} className="mb-4 bg-app-surface p-3 rounded-lg border border-app-border animate-enter">
                      <input 
                        autoFocus
                        type="text"
                        placeholder={t('settings.clientName', currentLang)}
                        className="w-full bg-app-bg border border-app-border rounded px-3 py-2 text-sm text-white focus:border-brand-primary outline-none mb-2"
                        value={newClientName}
                        onChange={e => setNewClientName(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setIsCreatingClient(false)} className="text-xs px-3 py-1.5 text-brand-muted hover:text-white">{t('settings.cancel', currentLang)}</button>
                          <button type="submit" className="text-xs px-3 py-1.5 bg-brand-primary text-white rounded hover:bg-brand-hover">{t('settings.create', currentLang)}</button>
                      </div>
                  </form>
              )}

              {/* Client List */}
              <div className="space-y-2">
                  {apiClients.length === 0 && !generatedSecret && (
                      <div className="text-center py-4 text-xs text-brand-muted italic">{t('settings.noKeys', currentLang)}</div>
                  )}
                  {apiClients.map(client => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-app-surface border border-app-border rounded-lg hover:border-brand-primary/50 transition-colors">
                           <div className="min-w-0">
                               <div className="flex items-center gap-2 mb-1">
                                   <Code size={14} className="text-brand-primary" />
                                   <span className="text-sm font-medium text-slate-200 truncate">{client.clientName}</span>
                               </div>
                               <div className="flex items-center gap-2 text-[10px] text-brand-muted font-mono">
                                   <span>{client.id}</span>
                                   <span className="w-1 h-1 bg-app-border rounded-full" />
                                   <span>{formatTime(client.createdAt)}</span>
                               </div>
                           </div>
                           <button 
                               onClick={() => handleRevokeClient(client.id)}
                               className="p-1.5 text-brand-muted hover:text-red-400 hover:bg-red-900/10 rounded transition-colors"
                               title="Revoke Access"
                           >
                               <Trash2 size={14} />
                           </button>
                      </div>
                  ))}
              </div>
          </div>

          <div className="w-full h-px bg-app-border" />

           {/* Account Actions */}
           <div>
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3 block flex items-center gap-2">
              <LogOut size={14} /> {t('settings.account', currentLang)}
            </label>
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-900/10 hover:bg-red-900/30 text-red-400 border border-red-900/20 rounded-xl py-3 text-sm font-bold transition-all group"
            >
                <LogOut size={16} className="group-hover:scale-110 transition-transform"/>
                {t('nav.logout', currentLang)}
            </button>
           </div>

        </div>

        <div className="p-4 bg-app-surface border-t border-app-border flex justify-end backdrop-blur-md">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-app-bg hover:bg-app-hover border border-app-border text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            {t('settings.close', currentLang)}
          </button>
        </div>
      </div>
    </div>
  );
};