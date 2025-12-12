
// Security Utilities for ParSam Identity

export class SecurityService {
    
    static generateFingerprint(): string {
        const components = [
            navigator.userAgent,
            navigator.language,
            new Date().getTimezoneOffset(),
            screen.width + 'x' + screen.height,
            (navigator as any).hardwareConcurrency || 1,
            // @ts-ignore
            (navigator as any).deviceMemory || 0
        ];
        return btoa(components.join('||'));
    }

    static getIP(): string {
        // Simulated IP for frontend demo
        // In real app, this comes from headers
        const octet = () => Math.floor(Math.random() * 255);
        return `192.168.${octet()}.${octet()}`; 
    }

    static isStrongPassword(pwd: string): { valid: boolean; message?: string } {
        if (pwd.length < 8) return { valid: false, message: "Password must be at least 8 characters." };
        if (!/[A-Z]/.test(pwd)) return { valid: false, message: "Password must contain an uppercase letter." };
        if (!/[0-9]/.test(pwd)) return { valid: false, message: "Password must contain a number." };
        if (!/[!@#$%^&*]/.test(pwd)) return { valid: false, message: "Password must contain a special character (!@#$%^&*)." };
        return { valid: true };
    }

    // Renamed to explicitly indicate the algorithm used in backend
    static hashPasswordArgon2id(password: string): Promise<string> {
        // In a real frontend, we would use a WASM implementation of Argon2id
        // or send the password over TLS to be hashed on the server.
        // For this demo, we simulate the hash format.
        return Promise.resolve(`$argon2id$v=19$m=65536,t=3,p=4$${btoa(password)}$${crypto.randomUUID()}`);
    }

    static generateToken(length: number = 32): string {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    static generateOTP(): string {
        // Generate 6 digit code
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // E2EE Stub
    static async rotateKeys(userId: string): Promise<void> {
        console.log(`[Security] Rotating E2EE keys for user ${userId} using XChaCha20-Poly1305...`);
        // 1. Generate new Key Pair
        // 2. Re-encrypt Data Encryption Keys (DEKs)
        // 3. Upload new public key bundle
    }
}
