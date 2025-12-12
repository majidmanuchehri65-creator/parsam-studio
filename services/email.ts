
// A mock service to simulate sending emails in a client-side only environment.
// In a real app, this would call a backend endpoint.

export interface MockEmail {
    to: string;
    subject: string;
    body: string;
    actionLink?: string;
    actionLabel?: string;
    timestamp: number;
}

class EmailService {
    private listeners: ((email: MockEmail) => void)[] = [];

    // Subscribe UI to receive emails (so we can show the "Inbox" modal)
    subscribe(callback: (email: MockEmail) => void) {
        this.listeners.push(callback);
    }

    unsubscribe(callback: (email: MockEmail) => void) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    async sendVerificationEmail(to: string, name: string, token: string) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const email: MockEmail = {
            to,
            subject: "Verify your ParSam Identity",
            body: `Hello ${name},\n\nWelcome to ParSam Studio. Please verify your email address to activate your secure account.\n\nThis link expires in 30 minutes.`,
            actionLink: `VERIFY::${token}`, // Custom protocol for our mock handler
            actionLabel: "Verify Account",
            timestamp: Date.now()
        };
        
        this.broadcast(email);
    }

    async sendPasswordReset(to: string, token: string) {
        await new Promise(resolve => setTimeout(resolve, 600));

        const email: MockEmail = {
            to,
            subject: "Reset Password Request",
            body: `We received a request to reset your password. If this wasn't you, please ignore this email.\n\nThis link expires in 15 minutes.`,
            actionLink: `RESET::${token}`,
            actionLabel: "Reset Password",
            timestamp: Date.now()
        };

        this.broadcast(email);
    }

    async send2FACode(to: string, code: string) {
        await new Promise(resolve => setTimeout(resolve, 400));

        const email: MockEmail = {
            to,
            subject: "ParSam Security Code",
            body: `Your verification code is: ${code}\n\nDo not share this code with anyone.`,
            timestamp: Date.now()
        };

        this.broadcast(email);
    }

    async sendWelcome(to: string, name: string) {
        const email: MockEmail = {
            to,
            subject: "Welcome to ParSam Studio",
            body: `Hello ${name},\n\nYour account has been successfully activated. Your secure cloud container is ready.\n\nEnjoy the ecosystem!`,
            timestamp: Date.now()
        };
        // Fire and forget, slight delay
        setTimeout(() => this.broadcast(email), 2000);
    }

    async sendSecurityAlert(to: string, details: string) {
        const email: MockEmail = {
            to,
            subject: "Security Alert: Suspicious Login",
            body: `We detected a login from a new device or location.\n\nDetails: ${details}\n\nIf this was you, you can ignore this message.`,
            timestamp: Date.now()
        };
        this.broadcast(email);
    }

    private broadcast(email: MockEmail) {
        console.log(`[EMAIL SERVICE] To: ${email.to} | Subject: ${email.subject}`);
        this.listeners.forEach(cb => cb(email));
    }
}

export const MockEmailService = new EmailService();
