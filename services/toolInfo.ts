
import { Language } from './i18n';

export interface ToolInfoData {
    title: string;
    shortSummary: string;
    description: string;
    purpose: string;
    features: string[];
    usage: string;
}

const DATA: Record<string, Record<Language, ToolInfoData>> = {
    notes: {
        en: {
            title: "ParSam Notes",
            shortSummary: "AI-enhanced note-taking with vector search.",
            description: "A comprehensive document creation suite integrated with Gemini AI. It supports rich text, voice dictation, and smart attachments.",
            purpose: "To capture, organize, and synthesize ideas efficiently using AI assistance.",
            features: ["Semantic Search", "Voice Dictation", "AI Summarization", "Attachment OCR"],
            usage: "Use the Editor to write. Click the Sparkles icon for AI help. Use the sidebar to organize folders."
        },
        de: {
            title: "ParSam Notizen",
            shortSummary: "KI-gestützte Notizen mit Vektorsuche.",
            description: "Eine umfassende Dokumentensuite, integriert mit Gemini AI. Unterstützt Rich Text, Diktat und intelligente Anhänge.",
            purpose: "Ideen effizient mit KI-Unterstützung erfassen, organisieren und synthetisieren.",
            features: ["Semantische Suche", "Sprachdiktat", "KI-Zusammenfassung", "Anhang-OCR"],
            usage: "Nutzen Sie den Editor zum Schreiben. Klicken Sie auf das Funken-Symbol für KI-Hilfe."
        },
        fa: {
            title: "یادداشت‌های ParSam",
            shortSummary: "یادداشت‌برداری پیشرفته با جستجوی برداری و هوش مصنوعی.",
            description: "مجموعه‌ای کامل برای ایجاد اسناد که با جمینای گوگل یکپارچه شده است. پشتیبانی از متن غنی، تایپ صوتی و پیوست‌های هوشمند.",
            purpose: "ثبت، سازماندهی و ترکیب ایده‌ها به صورت کارآمد با کمک هوش مصنوعی.",
            features: ["جستجوی معنایی", "تایپ صوتی", "خلاصه‌سازی هوشمند", "استخراج متن از تصویر"],
            usage: "از ویرایشگر برای نوشتن استفاده کنید. برای کمک هوش مصنوعی روی آیکون جرقه کلیک کنید."
        }
    },
    logos: {
        en: {
            title: "ParSam Logo Studio",
            shortSummary: "Vector-style brand generation.",
            description: "An AI-powered design studio that generates professional logos based on industry parameters and style preferences.",
            purpose: "To rapidly prototype and generate brand assets.",
            features: ["Style Presets", "Voice Prompting", "Vector-like PNG Output", "History Management"],
            usage: "Enter your brand name, select a style, and click Generate. Use voice commands to refine the prompt."
        },
        de: {
            title: "ParSam Logo-Studio",
            shortSummary: "Markenerstellung im Vektor-Stil.",
            description: "Ein KI-gestütztes Designstudio, das professionelle Logos basierend auf Industrieparametern und Stilvorlieben generiert.",
            purpose: "Zum schnellen Prototyping und Erstellen von Marken-Assets.",
            features: ["Stil-Voreinstellungen", "Sprach-Prompts", "Vektorähnliche PNG-Ausgabe", "Verlauf"],
            usage: "Geben Sie Ihren Markennamen ein, wählen Sie einen Stil und klicken Sie auf Generieren."
        },
        fa: {
            title: "استودیو لوگوی ParSam",
            shortSummary: "تولید برند با سبک وکتور.",
            description: "یک استودیوی طراحی مبتنی بر هوش مصنوعی که لوگوهای حرفه‌ای را بر اساس پارامترهای صنعت و سلیقه شما تولید می‌کند.",
            purpose: "نمونه‌سازی سریع و تولید دارایی‌های برند.",
            features: ["پیش‌تنظیمات سبک", "فرمان صوتی", "خروجی PNG شبه وکتور", "مدیریت تاریخچه"],
            usage: "نام برند را وارد کنید، سبک را انتخاب کنید و روی تولید کلیک کنید."
        }
    },
    voice: {
        en: {
            title: "ParSam Voice AI",
            shortSummary: "Neural speech processing & command execution.",
            description: "A dual-mode voice interface that handles real-time transcription and executes system commands via voice.",
            purpose: "Hands-free control and rapid text generation.",
            features: ["Real-time Transcription", "Command Mode", "Visual Audio Feedback", "Multi-language Support"],
            usage: "Toggle between Command and Dictation modes. Speak clearly to execute actions or type text."
        },
        de: {
            title: "ParSam Sprach-KI",
            shortSummary: "Neuronale Sprachverarbeitung & Befehlsausführung.",
            description: "Eine Dual-Mode-Sprachschnittstelle für Echtzeit-Transkription und Systemsteuerung.",
            purpose: "Freihändige Steuerung und schnelle Texterstellung.",
            features: ["Echtzeit-Transkription", "Befehlsmodus", "Visuelles Audio-Feedback", "Mehrsprachigkeit"],
            usage: "Wechseln Sie zwischen Befehls- und Diktiermodus. Sprechen Sie deutlich."
        },
        fa: {
            title: "هوش صوتی ParSam",
            shortSummary: "پردازش عصبی گفتار و اجرای فرامین.",
            description: "رابط صوتی دوحالته که تبدیل گفتار به متن در لحظه و اجرای فرامین سیستمی را انجام می‌دهد.",
            purpose: "کنترل بدون دست و تولید سریع متن.",
            features: ["تایپ صوتی زنده", "حالت فرمان", "بازخورد بصری صوتی", "پشتیبانی چندزبانه"],
            usage: "بین حالت فرمان و دیکته جابجا شوید. برای اجرای دستورات یا تایپ متن به وضوح صحبت کنید."
        }
    },
    drive: {
        en: {
            title: "ParSam File Manager",
            shortSummary: "Secure cloud storage with AI analysis.",
            description: "A secure file system that automatically categorizes uploads and allows for AI-driven content extraction (OCR).",
            purpose: "To store, secure, and analyze digital assets.",
            features: ["Auto-Categorization", "Encryption (Simulated)", "OCR & Extraction", "Storage Insights"],
            usage: "Drag and drop files to upload. Use the context menu to encrypt or extract text."
        },
        de: {
            title: "ParSam Dateimanager",
            shortSummary: "Sicherer Cloud-Speicher mit KI-Analyse.",
            description: "Ein sicheres Dateisystem, das Uploads automatisch kategorisiert und KI-gesteuerte Inhaltsanalyse ermöglicht.",
            purpose: "Zum Speichern, Sichern und Analysieren digitaler Assets.",
            features: ["Auto-Kategorisierung", "Verschlüsselung", "OCR & Extraktion", "Speicher-Einblicke"],
            usage: "Dateien per Drag & Drop hochladen. Kontextmenü für Verschlüsselung nutzen."
        },
        fa: {
            title: "مدیریت فایل ParSam",
            shortSummary: "فضای ابری امن با تحلیل هوشمند.",
            description: "سیستم فایل امن که آپلودها را خودکار دسته‌بندی می‌کند و امکان استخراج محتوا با هوش مصنوعی (OCR) را فراهم می‌سازد.",
            purpose: "ذخیره، ایمن‌سازی و تحلیل دارایی‌های دیجیتال.",
            features: ["دسته‌بندی خودکار", "رمزنگاری (شبیه‌سازی)", "OCR و استخراج", "آمار فضای ذخیره‌سازی"],
            usage: "فایل‌ها را بکشید و رها کنید. برای رمزنگاری یا استخراج متن از منو استفاده کنید."
        }
    },
    chat: {
        en: {
            title: "ParSam Chat AI",
            shortSummary: "Context-aware global assistant.",
            description: "A persistent chat interface that remembers conversation history and can perform actions across the platform.",
            purpose: "To provide a conversational interface for help, drafting, and navigation.",
            features: ["Context Retention", "Tool Execution", "Multi-turn Conversations", "Note Awareness"],
            usage: "Type a message to ask questions about your data or request system actions."
        },
        de: {
            title: "ParSam Chat-KI",
            shortSummary: "Kontextbewusster globaler Assistent.",
            description: "Eine persistente Chat-Schnittstelle, die sich an den Gesprächsverlauf erinnert und Aktionen ausführen kann.",
            purpose: "Bietet eine konversationelle Schnittstelle für Hilfe und Navigation.",
            features: ["Kontext-Gedächtnis", "Werkzeug-Ausführung", "Multi-Turn-Gespräche", "Notiz-Bewusstsein"],
            usage: "Geben Sie eine Nachricht ein, um Fragen zu Ihren Daten zu stellen."
        },
        fa: {
            title: "چت هوشمند ParSam",
            shortSummary: "دستیار جهانی آگاه به زمینه.",
            description: "رابط چت پایدار که تاریخچه مکالمه را به یاد می‌آورد و می‌تواند اقدامات مختلفی را در پلتفرم انجام دهد.",
            purpose: "ارائه رابط گفتگویی برای راهنمایی، پیش‌نویس و ناوبری.",
            features: ["حفظ زمینه", "اجرای ابزار", "مکالمات چندمرحله‌ای", "آگاهی از یادداشت‌ها"],
            usage: "پیامی بنویسید تا درباره داده‌هایتان سوال کنید یا درخواست انجام کاری را داشته باشید."
        }
    },
    office: {
        en: {
            title: "ParSam Office AI",
            shortSummary: "Intelligent document processing.",
            description: "A suite of AI tools for generating reports, analyzing spreadsheets, and automating routine office tasks.",
            purpose: "To streamline administrative and documentation workflows.",
            features: ["Report Generation", "Data Analysis", "Automated Formatting", "Template Library"],
            usage: "Select a template or upload a document to begin processing."
        },
        de: {
            title: "ParSam Büro-KI",
            shortSummary: "Intelligente Dokumentenverarbeitung.",
            description: "Eine Suite von KI-Tools zur Erstellung von Berichten, Analyse von Tabellenkalkulationen und Automatisierung von Routineaufgaben.",
            purpose: "Zur Rationalisierung von Verwaltungs- und Dokumentationsabläufen.",
            features: ["Berichterstellung", "Datenanalyse", "Automatisierte Formatierung", "Vorlagenbibliothek"],
            usage: "Wählen Sie eine Vorlage oder laden Sie ein Dokument hoch."
        },
        fa: {
            title: "هوش اداری ParSam",
            shortSummary: "پردازش هوشمند اسناد.",
            description: "مجموعه‌ای از ابزارهای هوش مصنوعی برای تولید گزارش‌ها، تحلیل صفحات گسترده و خودکارسازی وظایف روزمره اداری.",
            purpose: "تسهیل جریان‌های کاری اداری و مستندسازی.",
            features: ["تولید گزارش", "تحلیل داده", "قالب‌بندی خودکار", "کتابخانه قالب‌ها"],
            usage: "یک قالب انتخاب کنید یا سندی را برای شروع پردازش آپلود کنید."
        }
    },
    system: {
        en: {
            title: "ParSam System Core (CMC)",
            shortSummary: "Central Management Console.",
            description: "Administrative dashboard for monitoring user activity, system health, security threats, and infrastructure status.",
            purpose: "To maintain and monitor the ecosystem's operational integrity.",
            features: ["Real-time Metrics", "Security Logs", "User Management", "Self-Healing"],
            usage: "Monitor the dashboard for alerts. Use tabs to inspect specific subsystems."
        },
        de: {
            title: "ParSam Systemkern (CMC)",
            shortSummary: "Zentrale Management-Konsole.",
            description: "Administratives Dashboard zur Überwachung von Benutzeraktivität, Systemstatus und Sicherheitsbedrohungen.",
            purpose: "Zur Aufrechterhaltung der betrieblichen Integrität.",
            features: ["Echtzeit-Metriken", "Sicherheitsprotokolle", "Benutzerverwaltung", "Selbstheilung"],
            usage: "Überwachen Sie das Dashboard auf Warnungen."
        },
        fa: {
            title: "هسته سیستم ParSam",
            shortSummary: "کنسول مدیریت مرکزی.",
            description: "داشبورد مدیریتی برای نظارت بر فعالیت کاربران، سلامت سیستم، تهدیدات امنیتی و وضعیت زیرساخت.",
            purpose: "حفظ و نظارت بر یکپارچگی عملیاتی اکوسیستم.",
            features: ["متریک‌های زنده", "لاگ‌های امنیتی", "مدیریت کاربران", "خودترمیمی"],
            usage: "داشبورد را برای هشدارها بررسی کنید. از تب‌ها برای بازرسی زیرسیستم‌ها استفاده کنید."
        }
    },
    dev: {
        en: {
            title: "ParSam Developer Hub",
            shortSummary: "API documentation & architecture.",
            description: "Resources for developers integrating with the ParSam ecosystem, including OpenAPI specs and CI/CD pipelines.",
            purpose: "To facilitate extension and maintenance of the platform.",
            features: ["OpenAPI Spec", "Architecture Diagrams", "CI/CD Status", "Security Audit"],
            usage: "Browse the API definitions or check the build pipeline status."
        },
        de: {
            title: "ParSam Entwickler-Hub",
            shortSummary: "API-Dokumentation & Architektur.",
            description: "Ressourcen für Entwickler, einschließlich OpenAPI-Spezifikationen und CI/CD-Pipelines.",
            purpose: "Erleichterung der Erweiterung und Wartung der Plattform.",
            features: ["OpenAPI-Spezifikation", "Architektur-Diagramme", "CI/CD-Status", "Sicherheitsaudit"],
            usage: "Durchsuchen Sie die API-Definitionen."
        },
        fa: {
            title: "مرکز توسعه‌دهندگان ParSam",
            shortSummary: "مستندات API و معماری.",
            description: "منابعی برای توسعه‌دهندگان جهت یکپارچه‌سازی با اکوسیستم پارسام، شامل مشخصات OpenAPI و پایپ‌لاین‌های CI/CD.",
            purpose: "تسهیل توسعه و نگهداری پلتفرم.",
            features: ["مشخصات OpenAPI", "نمودارهای معماری", "وضعیت CI/CD", "ممیزی امنیتی"],
            usage: "تعاریف API را مرور کنید یا وضعیت پایپ‌لاین بیلد را بررسی کنید."
        }
    }
};

export const getToolInfo = (toolId: string, lang: Language): ToolInfoData => {
    return DATA[toolId]?.[lang] || DATA[toolId]?.['en'] || {
        title: "Unknown Tool",
        shortSummary: "No description available.",
        description: "No detailed description available for this tool.",
        purpose: "Unknown",
        features: [],
        usage: ""
    };
};
