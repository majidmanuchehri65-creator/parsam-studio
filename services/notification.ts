
import { AppNotification } from '../types';
import { MockEmailService } from './email';

class NotificationServiceClass {
    private listeners: ((notification: AppNotification) => void)[] = [];
    
    // Subscribe UI components to receive toasts
    subscribe(callback: (notification: AppNotification) => void) {
        this.listeners.push(callback);
    }

    unsubscribe(callback: (notification: AppNotification) => void) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    // Main entry point for sending notifications
    async send({
        title, 
        message, 
        type = 'info', 
        channels = ['app'], 
        actionLabel, 
        actionFn,
        emailTo
    }: {
        title: string,
        message: string,
        type?: AppNotification['type'],
        channels?: ('app' | 'push' | 'email')[],
        actionLabel?: string,
        actionFn?: () => void,
        emailTo?: string
    }) {
        const notification: AppNotification = {
            id: crypto.randomUUID(),
            title,
            message,
            type,
            timestamp: Date.now(),
            read: false,
            actionLabel,
            actionFn
        };

        // Channel: In-App Toast
        if (channels.includes('app')) {
            this.broadcast(notification);
        }

        // Channel: System Push Notification
        if (channels.includes('push')) {
            this.sendPush(title, message);
        }

        // Channel: Email
        if (channels.includes('email') && emailTo) {
            await MockEmailService.sendSecurityAlert(emailTo, `${title}: ${message}`);
        }
    }

    private broadcast(notification: AppNotification) {
        this.listeners.forEach(cb => cb(notification));
    }

    private sendPush(title: string, body: string) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body, icon: '/favicon.ico' });
                }
            });
        }
    }
}

export const NotificationService = new NotificationServiceClass();
