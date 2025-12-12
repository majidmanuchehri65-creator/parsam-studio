
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { MockEmailService, MockEmail } from '../services/email';
import { Language, t, getDir } from '../services/i18n';
import { ShieldCheck, User as UserIcon, Lock, Mail, ArrowRight, Globe, Fingerprint, RefreshCcw, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

type AuthState = 'LOGIN' | 'REGISTER' | 'VERIFY_EMAIL' | '2FA' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, lang, setLang }) => {
  const [authState, setAuthState] = useState<AuthState>('LOGIN');
  
  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authCode, setAuthCode] = useState(''); // For 2FA or Token
  
  // UI State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inboxEmails, setInboxEmails] = useState<MockEmail[]>([]);
  const [showInbox, setShowInbox] = useState(false);

  useEffect(() => {
      // Subscribe to simulated emails
      const handleEmail = (email: MockEmail) => {
          setInboxEmails(prev => [email, ...prev]);
          setShowInbox(true); // Pop up notification
      };
      MockEmailService.subscribe(handleEmail);
      return () => MockEmailService.unsubscribe(handleEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate network processing
      await new Promise(resolve => setTimeout(resolve, 800));

      if (authState === 'LOGIN') {
          const res = StorageService.login(email, password);
          if (res.status === 'success' && res.user) {
              onLogin(res.user);
          } else if (res.status === '2fa_required') {
              setAuthState('2FA');
          }
      } 
      else if (authState === 'REGISTER') {
          StorageService.register(fullName, email, password, lang);
          setAuthState('VERIFY_EMAIL');
      }
      else if (authState === '2FA') {
          const user = StorageService.verify2FA(email, authCode);
          onLogin(user);
      }
      else if (authState === 'FORGOT_PASSWORD') {
          StorageService.requestPasswordReset(email);
          alert("Reset link sent to " + email); // Simulated
      }
      else if (authState === 'RESET_PASSWORD') {
          StorageService.resetPassword(authCode, password);
          alert("Password reset successfully.");
          setAuthState('LOGIN');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Simulated Verification Link Click
  const handleSimulatedLinkClick = (actionLink: string) => {
      if (actionLink.startsWith("VERIFY::")) {
          const token = actionLink.split("::")[1];
          try {
              StorageService.verifyAccount(token);
              alert("Account Verified!");
              setAuthState('LOGIN');
              setShowInbox(false);
          } catch (e: any) {
              alert(e.message);
          }
      } else if (actionLink.startsWith("RESET::")) {
          const token = actionLink.split("::")[1];
          setAuthCode(token); // Set the token as the code for reset flow
          setAuthState('RESET_PASSWORD');
          setShowInbox(false);
      }
  };

  const dir = getDir(lang);

  return (
    <div dir={dir} className={`min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans ${lang === 'fa' ? 'font-vazir' : 'font-sans'}`}>
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-parsam-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
         <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur rounded-full px-3 py-1.5 border border-slate-800">
             <Globe size={14} className="text-slate-400" />
             <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-xs text-slate-300 outline-none border-none appearance-none cursor-pointer"
             >
                 <option value="en">English</option>
                 <option value="de">Deutsch</option>
                 <option value="fa">فارسی</option>
             </select>
         </div>
      </div>

      {/* MOCK EMAIL NOTIFICATION SYSTEM */}
      {showInbox && (
          <div className="absolute top-20 right-6 z-50 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right">
              <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2"><Mail size={12}/> System Email (Simulated)</span>
                  <button onClick={() => setShowInbox(false)} className="text-slate-500 hover:text-white"><X size={14}/></button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                  {inboxEmails.map((mail, idx) => (
                      <div key={idx} className="p-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                          <div className="text-xs font-bold text-parsam-400 mb-1">{mail.subject}</div>
                          <div className="text-[10px] text-slate-400 whitespace-pre-wrap mb-2">{mail.body}</div>
                          {mail.actionLink && (
                              <button 
                                onClick={() => handleSimulatedLinkClick(mail.actionLink!)}
                                className="w-full bg-parsam-600 hover:bg-parsam-500 text-white text-xs py-1.5 rounded"
                              >
                                  {mail.actionLabel || "Click Link"}
                              </button>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 z-10 relative">
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-parsam-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-parsam-900/50 mb-4 transform rotate-3">
                 <span className="font-bold text-white text-3xl">P</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ParSam Identity</h1>
            <p className="text-slate-400 text-sm mt-1">{t('auth.subtitle', lang)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* REGISTER: Full Name */}
            {authState === 'REGISTER' && (
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                        {t('auth.fullname', lang)}
                    </label>
                    <div className="relative group">
                        <div className={`absolute top-3 text-slate-500 transition-colors group-focus-within:text-parsam-400 ${lang === 'fa' ? 'right-3' : 'left-3'}`}>
                            <UserIcon size={18} />
                        </div>
                        <input 
                            type="text" 
                            required
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className={`w-full bg-slate-950 border border-slate-800 rounded-xl py-3 text-slate-200 focus:outline-none focus:border-parsam-500 transition-all ${lang === 'fa' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                            placeholder="John Doe"
                        />
                    </div>
                </div>
            )}

            {/* Email Field (Visible in most states) */}
            {['LOGIN', 'REGISTER', 'FORGOT_PASSWORD'].includes(authState) && (
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                        {t('auth.email', lang)}
                    </label>
                    <div className="relative group">
                        <div className={`absolute top-3 text-slate-500 transition-colors group-focus-within:text-parsam-400 ${lang === 'fa' ? 'right-3' : 'left-3'}`}>
                            <Mail size={18} />
                        </div>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={authState === '2FA'}
                            className={`w-full bg-slate-950 border border-slate-800 rounded-xl py-3 text-slate-200 focus:outline-none focus:border-parsam-500 transition-all ${lang === 'fa' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                            placeholder="name@company.com"
                        />
                    </div>
                </div>
            )}

            {/* Password Field */}
            {['LOGIN', 'REGISTER', 'RESET_PASSWORD'].includes(authState) && (
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                        {authState === 'RESET_PASSWORD' ? t('auth.newPass', lang) : t('auth.password', lang)}
                    </label>
                    <div className="relative group">
                        <div className={`absolute top-3 text-slate-500 transition-colors group-focus-within:text-parsam-400 ${lang === 'fa' ? 'right-3' : 'left-3'}`}>
                            <Lock size={18} />
                        </div>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className={`w-full bg-slate-950 border border-slate-800 rounded-xl py-3 text-slate-200 focus:outline-none focus:border-parsam-500 transition-all ${lang === 'fa' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                            placeholder="••••••••"
                        />
                    </div>
                    {authState === 'LOGIN' && (
                        <div className="text-right mt-1">
                            <button type="button" onClick={() => setAuthState('FORGOT_PASSWORD')} className="text-[10px] text-parsam-400 hover:text-parsam-300">
                                {t('auth.forgotPass', lang)}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Verification / 2FA Code Input */}
            {['2FA', 'RESET_PASSWORD'].includes(authState) && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                        {authState === '2FA' ? t('auth.2faDesc', lang) : "Reset Token (from Email)"}
                    </label>
                    <div className="relative group">
                        <div className={`absolute top-3 text-slate-500 transition-colors group-focus-within:text-parsam-400 ${lang === 'fa' ? 'right-3' : 'left-3'}`}>
                            <Fingerprint size={18} />
                        </div>
                        <input 
                            type="text" 
                            required
                            value={authCode}
                            onChange={e => setAuthCode(e.target.value)}
                            className={`w-full bg-slate-950 border border-slate-800 rounded-xl py-3 text-slate-200 focus:outline-none focus:border-parsam-500 transition-all tracking-widest text-center font-mono`}
                            placeholder="000000"
                        />
                    </div>
                </div>
            )}

            {/* Email Verification State Display */}
            {authState === 'VERIFY_EMAIL' && (
                <div className="text-center py-4 space-y-3 animate-in zoom-in-95">
                    <div className="w-12 h-12 bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto text-yellow-500">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">{t('auth.verifyEmail', lang)}</h3>
                        <p className="text-xs text-slate-400 mt-1 px-4">{t('auth.verifyDesc', lang)}</p>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/50">
                        Check the "Simulated Email" popup in top right
                    </div>
                    <button type="button" onClick={() => setAuthState('LOGIN')} className="text-xs text-parsam-400 hover:text-white">
                        {t('auth.backLogin', lang)}
                    </button>
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs flex items-center gap-2 justify-center">
                    <AlertTriangle size={12} /> {error}
                </div>
            )}

            {authState !== 'VERIFY_EMAIL' && (
                <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full py-3.5 mt-2 shadow-xl shadow-parsam-600/10"
                    loading={loading}
                >
                    {authState === 'LOGIN' ? t('auth.login', lang) : 
                     authState === 'REGISTER' ? t('auth.register', lang) :
                     authState === '2FA' ? "Verify & Login" :
                     authState === 'FORGOT_PASSWORD' ? t('auth.sendReset', lang) :
                     t('auth.resetPass', lang)}
                    
                    {!loading && <ArrowRight size={16} className={lang === 'fa' ? 'rotate-180' : ''} />}
                </Button>
            )}
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            {authState === 'LOGIN' ? (
                <button 
                    onClick={() => { setAuthState('REGISTER'); setError(''); }}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    {t('auth.noAccount', lang)} {' '}
                    <span className="text-parsam-400 font-medium">{t('auth.register', lang)}</span>
                </button>
            ) : authState === 'REGISTER' ? (
                <button 
                    onClick={() => { setAuthState('LOGIN'); setError(''); }}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    {t('auth.hasAccount', lang)} {' '}
                    <span className="text-parsam-400 font-medium">{t('auth.login', lang)}</span>
                </button>
            ) : (
                <button 
                    onClick={() => { setAuthState('LOGIN'); setError(''); }}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    {t('auth.backLogin', lang)}
                </button>
            )}
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest">
            <ShieldCheck size={12} />
            Secure Enterprise Login
        </div>
      </div>
    </div>
  );
};
