import { randomBytes } from 'crypto';

export const generate32CharTimeUUID = () => {
    const ts = Date.now().toString(16).padStart(12, '0'); // 12 chars
    const rand = randomBytes(10).toString('hex');         // 20 chars
    return `${ts}${rand}`;
}

export const generate24CharTimeUUID = () => {
    const timestamp = Date.now().toString(16).padStart(8, '0');  // 8 hex chars
    const random = randomBytes(8).toString('hex');               // 16 hex chars
    return timestamp + random;                                   // 24 chars total
}

