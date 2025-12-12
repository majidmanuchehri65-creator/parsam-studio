
export type Language = 'en' | 'de' | 'fa';

export const getDir = (lang: Language): 'rtl' | 'ltr' => {
  return lang === 'fa' ? 'rtl' : 'ltr';
};

// -- TYPES --
interface DictionaryEntry {
  en: string;
  de: string;
  fa: string;
}

interface Dictionary {
  [key: string]: DictionaryEntry;
}

// -- CENTRAL LANGUAGE REPOSITORY --
export const dict: Dictionary = {
  // --- NAVIGATION ---
  'nav.allNotes': { en: 'Notes', de: 'Notizen', fa: 'یادداشت‌ها' },
  'nav.favorites': { en: 'Favorites', de: 'Favoriten', fa: 'مورد علاقه' },
  'nav.archive': { en: 'Archive', de: 'Archiv', fa: 'بایگانی' },
  'nav.trash': { en: 'Trash', de: 'Papierkorb', fa: 'سطل زباله' },
  'nav.settings': { en: 'Settings', de: 'Einstellungen', fa: 'تنظیمات' },
  'nav.folders': { en: 'FOLDERS', de: 'ORDNER', fa: 'پوشه‌ها' },
  'nav.newFolder': { en: 'New Folder', de: 'Neuer Ordner', fa: 'پوشه جدید' },
  'nav.logout': { en: 'Log Out', de: 'Abmelden', fa: 'خروج' },
  'nav.sync': { en: 'Cloud Sync', de: 'Cloud-Sync', fa: 'همگام‌سازی ابری' },

  // --- MODULE NAMES ---
  'module.notes': { en: 'Notes', de: 'Notizen', fa: 'یادداشت‌ها' },
  'module.logos': { en: 'Logo Studio', de: 'Logo Studio', fa: 'استودیو لوگو' },
  'module.voice': { en: 'Voice AI', de: 'Sprach KI', fa: 'هوش صوتی' },
  'module.drive': { en: 'Data Manager', de: 'Datenmanager', fa: 'مدیریت داده' },
  'module.chat': { en: 'Chat AI', de: 'Chat KI', fa: 'چت هوشمند' },
  'module.office': { en: 'Office AI', de: 'Büro KI', fa: 'هوش اداری' },
  'module.system': { en: 'System Core', de: 'Systemkern', fa: 'هسته سیستم' },
  'module.dev': { en: 'DevHoop', de: 'DevHoop', fa: 'هاب توسعه' },

  // --- APP SHELL & ALERTS ---
  'app.syncing': { en: 'Syncing...', de: 'Synchronisieren...', fa: 'در حال همگام‌سازی...' },
  'app.criticalUpdate': { en: 'Critical Security Update', de: 'Kritisches Sicherheitsupdate', fa: 'به‌روزرسانی امنیتی حیاتی' },
  'app.installNow': { en: 'Install Update Now', de: 'Jetzt installieren', fa: 'نصب به‌روزرسانی' },
  'app.updateAvailable': { en: 'Update Available', de: 'Update verfügbar', fa: 'به‌روزرسانی موجود است' },
  'app.cmcAlert': { en: 'CMC Alert', de: 'CMC Warnung', fa: 'هشدار CMC' },
  'app.applyFix': { en: 'Apply Fix', de: 'Korrektur anwenden', fa: 'اعمال اصلاح' },
  'app.ignore': { en: 'Ignore', de: 'Ignorieren', fa: 'نادیده گرفتن' },
  'app.recAction': { en: 'Recommended Action', de: 'Empfohlene Maßnahme', fa: 'اقدام پیشنهادی' },

  // --- SETTINGS MODAL ---
  'settings.title': { en: 'System Settings', de: 'Systemeinstellungen', fa: 'تنظیمات سیستم' },
  'settings.language': { en: 'Language', de: 'Sprache', fa: 'زبان' },
  'settings.interface': { en: 'Interface Customization', de: 'Schnittstellenanpassung', fa: 'سفارشی‌سازی رابط' },
  'settings.glass': { en: 'Glass Intensity', de: 'Glasintensität', fa: 'شدت شفافیت' },
  'settings.density': { en: 'Layout Density', de: 'Layoutdichte', fa: 'تراکم چیدمان' },
  'settings.devices': { en: 'Active Devices', de: 'Aktive Geräte', fa: 'دستگاه‌های فعال' },
  'settings.currentDevice': { en: 'Current Device', de: 'Aktuelles Gerät', fa: 'دستگاه فعلی' },
  'settings.revoke': { en: 'Revoke', de: 'Widerrufen', fa: 'لغو دسترسی' },
  'settings.lastSeen': { en: 'Last seen', de: 'Zuletzt gesehen', fa: 'آخرین بازدید' },
  'settings.apiKeys': { en: 'API Keys / Clients', de: 'API-Schlüssel / Clients', fa: 'کلیدهای API' },
  'settings.generateKey': { en: 'Generate New Key', de: 'Neuen Schlüssel generieren', fa: 'تولید کلید جدید' },
  'settings.clientName': { en: 'Client Name', de: 'Client-Name', fa: 'نام کلاینت' },
  'settings.secretWarning': { en: 'Copy this now! It will not be shown again.', de: 'Kopieren Sie dies jetzt! Es wird nicht mehr angezeigt.', fa: 'الان کپی کنید! دیگر نمایش داده نخواهد شد.' },
  'settings.copied': { en: 'I have copied it', de: 'Ich habe es kopiert', fa: 'کپی کردم' },
  'settings.create': { en: 'Create', de: 'Erstellen', fa: 'ایجاد' },
  'settings.cancel': { en: 'Cancel', de: 'Abbrechen', fa: 'لغو' },
  'settings.close': { en: 'Close', de: 'Schließen', fa: 'بستن' },
  'settings.account': { en: 'Account', de: 'Konto', fa: 'حساب کاربری' },
  'settings.noKeys': { en: 'No active API keys found.', de: 'Keine aktiven API-Schlüssel gefunden.', fa: 'هیچ کلید API فعالی یافت نشد.' },

  // --- LOGO STUDIO ---
  'logo.concept': { en: 'Concept', de: 'Konzept', fa: 'مفهوم' },
  'logo.conceptTip': { en: 'Define the core identity. Use text or voice.', de: 'Definieren Sie die Identität. Text oder Stimme nutzen.', fa: 'هویت اصلی را تعریف کنید. از متن یا صدا استفاده کنید.' },
  'logo.brandName': { en: 'BRAND NAME', de: 'MARKENNAME', fa: 'نام برند' },
  'logo.brandPlaceholder': { en: 'e.g. ParSam', de: 'z.B. ParSam', fa: 'مثلا پارسام' },
  'logo.prompt': { en: 'AI PROMPT', de: 'KI-PROMPT', fa: 'دستور هوش مصنوعی' },
  'logo.promptPlaceholder': { en: 'Describe your logo vision...', de: 'Beschreiben Sie Ihre Logo-Vision...', fa: 'چشم‌انداز لوگوی خود را توصیف کنید...' },
  'logo.inspiration': { en: 'Inspiration', de: 'Inspiration', fa: 'الهام‌بخش' },
  'logo.inspireTip': { en: 'Upload images or video clips.', de: 'Bilder oder Videoclips hochladen.', fa: 'تصاویر یا کلیپ‌های ویدیویی را آپلود کنید.' },
  'logo.upload': { en: 'Upload Image/Video', de: 'Bild/Video hochladen', fa: 'آپلود تصویر/ویدیو' },
  'logo.analyzing': { en: 'Analyzing Media...', de: 'Analysiere Medien...', fa: 'در حال تحلیل رسانه...' },
  'logo.clickChange': { en: 'Click to change', de: 'Zum Ändern klicken', fa: 'برای تغییر کلیک کنید' },
  'logo.insights': { en: 'AI Insights', de: 'KI-Erkenntnisse', fa: 'بینش هوشمند' },
  'logo.params': { en: 'Parameters', de: 'Parameter', fa: 'پارامترها' },
  'logo.paramsTip': { en: 'Fine-tune the output style.', de: 'Feinabstimmung des Ausgabestils.', fa: 'تنظیم دقیق سبک خروجی.' },
  'logo.generate': { en: 'Generate Logos', de: 'Logos generieren', fa: 'تولید لوگوها' },
  'logo.synthesizing': { en: 'Synthesizing...', de: 'Synthetisiere...', fa: 'در حال ساخت...' },
  'logo.idleTitle': { en: 'AI Design Engine Idle', de: 'KI-Design-Engine im Leerlauf', fa: 'موتور طراحی هوشمند آماده‌باش' },
  'logo.idleDesc': { en: 'Waiting for input to initialize Multi-AI sequence...', de: 'Warte auf Eingabe zum Starten der Multi-KI-Sequenz...', fa: 'منتظر ورودی برای شروع توالی هوش مصنوعی چندگانه...' },
  'logo.resultsTitle': { en: 'Generated Concepts', de: 'Generierte Konzepte', fa: 'مفاهیم تولید شده' },
  'logo.variants': { en: 'Variants Available', de: 'Varianten verfügbar', fa: 'نسخه موجود' },
  'logo.history': { en: 'Session History', de: 'Sitzungsverlauf', fa: 'تاریخچه نشست' },
  'logo.noHistory': { en: 'No history yet.', de: 'Noch kein Verlauf.', fa: 'هنوز تاریخچه‌ای نیست.' },
  'logo.settings': { en: 'Settings', de: 'Einstellungen', fa: 'تنظیمات' },
  'logo.engineActive': { en: 'Multi-AI Engine Active', de: 'Multi-KI-Engine Aktiv', fa: 'موتور چندگانه هوش مصنوعی فعال' },

  // --- EDITOR ---
  'editor.titlePlaceholder': { en: 'Note Title', de: 'Titel der Notiz', fa: 'عنوان یادداشت' },
  'editor.placeholder': { en: 'Start typing...', de: 'Tippen Sie hier...', fa: 'شروع به نوشتن کنید...' },
  'editor.page': { en: 'Page', de: 'Seite', fa: 'صفحه' },
  'editor.addPage': { en: 'Add Page', de: 'Seite hinzufügen', fa: 'افزودن صفحه' },
  'editor.addTag': { en: 'Add tag...', de: 'Tag hinzufügen...', fa: 'افزودن برچسب...' },
  'editor.trashMsg': { en: 'This note is in the trash.', de: 'Diese Notiz ist im Papierkorb.', fa: 'این یادداشت در سطل زباله است.' },
  'editor.deletePerm': { en: 'Delete Permanently', de: 'Endgültig löschen', fa: 'حذف دائمی' },
  'editor.unlock': { en: 'Unlock Note', de: 'Notiz entsperren', fa: 'باز کردن قفل' },
  'editor.enterPass': { en: 'Enter password...', de: 'Passwort eingeben...', fa: 'رمز عبور را وارد کنید...' },
  'editor.secured': { en: 'This note is secured', de: 'Diese Notiz ist gesichert', fa: 'این یادداشت محافظت شده است' },

  // --- LIST ---
  'list.search': { en: 'Search...', de: 'Suchen...', fa: 'جستجو...' },
  'list.smartSearch': { en: 'Smart Search...', de: 'Intelligente Suche...', fa: 'جستجوی هوشمند...' },
  'list.noNotes': { en: 'No notes found.', de: 'Keine Notizen gefunden.', fa: 'یادداشتی یافت نشد.' },
  'list.untitled': { en: 'Untitled', de: 'Unbenannt', fa: 'بدون عنوان' },
  'list.today': { en: 'Today', de: 'Heute', fa: 'امروز' },
  'list.yesterday': { en: 'Yesterday', de: 'Gestern', fa: 'دیروز' },
  'list.last7days': { en: 'Last 7 Days', de: 'Letzte 7 Tage', fa: '۷ روز گذشته' },
  'list.older': { en: 'Older', de: 'Älter', fa: 'قدیمی‌تر' },

  // --- AUTH ---
  'auth.welcome': { en: 'Welcome to ParSam Studio', de: 'Willkommen bei ParSam Studio', fa: 'به ParSam Studio خوش آمدید' },
  'auth.subtitle': { en: 'Secure AI-Powered Ecosystem', de: 'Sicheres KI-Ökosystem', fa: 'اکوسیستم امن هوش مصنوعی' },
  'auth.login': { en: 'Log In', de: 'Anmelden', fa: 'ورود' },
  'auth.register': { en: 'Create Account', de: 'Konto erstellen', fa: 'ایجاد حساب کاربری' },
  'auth.email': { en: 'Email Address', de: 'E-Mail-Adresse', fa: 'آدرس ایمیل' },
  'auth.fullname': { en: 'Full Name', de: 'Vollständiger Name', fa: 'نام کامل' },
  'auth.password': { en: 'Password', de: 'Passwort', fa: 'رمز عبور' },
  'auth.verifyEmail': { en: 'Verify Email', de: 'E-Mail bestätigen', fa: 'تایید ایمیل' },
  'auth.verifyDesc': { en: 'We sent a secure link to your email.', de: 'Wir haben einen sicheren Link an Ihre E-Mail gesendet.', fa: 'ما یک لینک امن به ایمیل شما ارسال کردیم.' },
  'auth.2faTitle': { en: 'Two-Factor Authentication', de: 'Zwei-Faktor-Authentifizierung', fa: 'احراز هویت دو مرحله‌ای' },
  'auth.2faDesc': { en: 'Enter the 6-digit code sent to your email.', de: 'Geben Sie den 6-stelligen Code ein.', fa: 'کد ۶ رقمی ارسال شده به ایمیل را وارد کنید.' },
  'auth.forgotPass': { en: 'Forgot Password?', de: 'Passwort vergessen?', fa: 'رمز عبور را فراموش کردید؟' },
  'auth.resetPass': { en: 'Reset Password', de: 'Passwort zurücksetzen', fa: 'بازنشانی رمز عبور' },
  'auth.newPass': { en: 'New Password', de: 'Neues Passwort', fa: 'رمز عبور جدید' },
  'auth.sendReset': { en: 'Send Reset Link', de: 'Reset-Link senden', fa: 'ارسال لینک بازنشانی' },
  'auth.backLogin': { en: 'Back to Login', de: 'Zurück zur Anmeldung', fa: 'بازگشت به ورود' },
  'auth.noAccount': { en: 'No account?', de: 'Kein Konto?', fa: 'حساب کاربری ندارید؟' },
  'auth.hasAccount': { en: 'Have an account?', de: 'Haben Sie ein Konto?', fa: 'حساب کاربری دارید؟' },

  // --- VOICE ---
  'voice.listening': { en: 'Listening...', de: 'Hören...', fa: 'در حال شنیدن...' },
  'voice.tapSpeak': { en: 'Tap microphone to speak', de: 'Zum Sprechen tippen', fa: 'برای صحبت ضربه بزنید' },
  'voice.dictating': { en: 'Dictating...', de: 'Diktieren...', fa: 'در حال دیکته...' },
  'voice.analyzing': { en: 'Analyzing intent...', de: 'Analysiere Absicht...', fa: 'تحلیل هدف...' },
  'voice.unknown': { en: 'Command not recognized.', de: 'Befehl nicht erkannt.', fa: 'دستور شناسایی نشد.' },
  'voice.executing': { en: 'Executing:', de: 'Ausführen:', fa: 'در حال اجرا:' },
  'voice.createNote': { en: 'Create Note from Text', de: 'Notiz aus Text erstellen', fa: 'ایجاد یادداشت از متن' },
  'voice.noteCreated': { en: 'Note created.', de: 'Notiz erstellt.', fa: 'یادداشت ایجاد شد.' },
  'voice.commandMode': { en: 'Command Mode', de: 'Befehlsmodus', fa: 'حالت فرمان' },
  'voice.dictationMode': { en: 'Dictation Mode', de: 'Diktier-Modus', fa: 'حالت دیکته' },

  // --- DEV HUB ---
  'dev.architecture': { en: 'System Architecture', de: 'Systemarchitektur', fa: 'معماری سیستم' },
  'dev.api': { en: 'OpenAPI Spec', de: 'OpenAPI-Spezifikation', fa: 'مشخصات OpenAPI' },
  'dev.starter': { en: 'Starter Kit', de: 'Starter-Kit', fa: 'کیت شروع' },
  'dev.cicd': { en: 'CI/CD Pipeline', de: 'CI/CD-Pipeline', fa: 'پایپ‌لاین CI/CD' },
  'dev.security': { en: 'Security Audit', de: 'Sicherheitsaudit', fa: 'ممیزی امنیتی' },
  'dev.status': { en: 'System Status', de: 'Systemstatus', fa: 'وضعیت سیستم' },
  'dev.operational': { en: 'All Systems Operational', de: 'Alle Systeme betriebsbereit', fa: 'همه سیستم‌ها فعال هستند' },

  // --- UPDATES ---
  'update.current': { en: 'Current Version', de: 'Aktuelle Version', fa: 'نسخه فعلی' },
  'update.check': { en: 'Check for Updates', de: 'Nach Updates suchen', fa: 'بررسی به‌روزرسانی' },
  'update.checking': { en: 'Checking...', de: 'Prüfe...', fa: 'در حال بررسی...' },
  'update.auto': { en: 'Auto-Maintenance', de: 'Auto-Wartung', fa: 'نگهداری خودکار' },
  'update.autoDesc': { en: 'Install non-critical updates automatically', de: 'Nicht-kritische Updates automatisch installieren', fa: 'نصب خودکار به‌روزرسانی‌های غیرحیاتی' },
  'update.beta': { en: 'Beta Channel', de: 'Beta-Kanal', fa: 'کانال بتا' },
  'update.betaDesc': { en: 'Get experimental features early', de: 'Experimentelle Funktionen frühzeitig erhalten', fa: 'دریافت زودهنگام ویژگی‌های آزمایشی' },
  'update.whatsNew': { en: "What's New", de: 'Was ist neu', fa: 'تغییرات جدید' },
  'update.installSecurity': { en: 'Install Security Patch Now', de: 'Sicherheitspatch jetzt installieren', fa: 'نصب وصله امنیتی' },
  'update.downloadInstall': { en: 'Download & Install', de: 'Herunterladen & Installieren', fa: 'دانلود و نصب' },
  'update.downloading': { en: 'Downloading Package...', de: 'Lade Paket herunter...', fa: 'دانلود بسته...' },
  'update.installing': { en: 'Verifying & Installing...', de: 'Überprüfen & Installieren...', fa: 'تایید و نصب...' },
  'update.complete': { en: 'Update Complete', de: 'Update abgeschlossen', fa: 'به‌روزرسانی کامل شد' },
  'update.history': { en: 'Update History', de: 'Update-Verlauf', fa: 'تاریخچه به‌روزرسانی' },
  'update.noLogs': { en: 'No update logs found.', de: 'Keine Update-Protokolle gefunden.', fa: 'لاگ به‌روزرسانی یافت نشد.' },

  // --- SELF HEALING ---
  'healing.title': { en: 'AI Self-Healing Engine', de: 'KI-Selbstheilungs-Engine', fa: 'موتور خودترمیمی هوشمند' },
  'healing.desc': { en: 'Autonomous diagnostics and automated repair system.', de: 'Autonome Diagnose und automatisches Reparatursystem.', fa: 'تشخیص خودکار و سیستم تعمیر اتوماتیک.' },
  'healing.scan': { en: 'Force System Scan', de: 'Systemscan erzwingen', fa: 'اسکن اجباری سیستم' },
  'healing.running': { en: 'Running Diagnostics...', de: 'Diagnose läuft...', fa: 'در حال اجرای عیب‌یابی...' },
  'healing.status': { en: 'System Integrity Status', de: 'Systemintegritätsstatus', fa: 'وضعیت یکپارچگی سیستم' },
  'healing.log': { en: 'Live Repair Log', de: 'Live-Reparaturprotokoll', fa: 'لاگ تعمیرات زنده' },
  'healing.scanning': { en: 'SCANNING', de: 'SCANNT', fa: 'در حال اسکن' },
  'healing.idle': { en: 'IDLE - MONITORING', de: 'LEERLAUF - ÜBERWACHUNG', fa: 'آمade‌باش - نظارت' },
  'healing.noAnomalies': { en: 'No anomalies detected. System operating within normal parameters.', de: 'Keine Anomalien erkannt. System arbeitet normal.', fa: 'هیچ ناهنجاری شناسایی نشد. سیستم در پارامترهای عادی کار می‌کند.' },
};

export const t = (key: string, lang: Language): string => {
  const entry = dict[key];
  if (!entry) {
    console.warn(`Missing translation key: ${key}`);
    return key; // Fallback to key itself to make missing strings obvious
  }
  return entry[lang];
};
