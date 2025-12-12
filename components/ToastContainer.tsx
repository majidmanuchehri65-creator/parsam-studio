
import React, { useState, useEffect } from 'react';
import { AppNotification } from '../types';
import { NotificationService } from '../services/notification';
import { CheckCircle, AlertTriangle, Info, XCircle, DownloadCloud, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<AppNotification[]>([]);

    useEffect(() => {
        const handleNotification = (n: AppNotification) => {
            setToasts(prev => [n, ...prev]);
            // Auto-dismiss after 5s unless it's an update alert
            if (n.type !== 'update') {
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== n.id));
                }, 5000);
            }
        };

        NotificationService.subscribe(handleNotification);
        return () => NotificationService.unsubscribe(handleNotification);
    }, []);

    const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

    const getIcon = (type: AppNotification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-green-400" />;
            case 'error': return <XCircle size={20} className="text-red-400" />;
            case 'warning': return <AlertTriangle size={20} className="text-yellow-400" />;
            case 'update': return <DownloadCloud size={20} className="text-parsam-400" />;
            default: return <Info size={20} className="text-blue-400" />;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div 
                    key={toast.id} 
                    className="pointer-events-auto bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-2xl w-80 animate-in slide-in-from-right-10 duration-300 flex items-start gap-3"
                >
                    <div className="mt-0.5 shrink-0">{getIcon(toast.type)}</div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-100">{toast.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{toast.message}</p>
                        
                        {toast.actionLabel && (
                            <button 
                                onClick={() => {
                                    if (toast.actionFn) toast.actionFn();
                                    remove(toast.id);
                                }}
                                className="mt-2 text-xs bg-parsam-600 hover:bg-parsam-500 text-white px-3 py-1.5 rounded transition-colors font-medium"
                            >
                                {toast.actionLabel}
                            </button>
                        )}
                    </div>
                    <button onClick={() => remove(toast.id)} className="text-slate-500 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};
