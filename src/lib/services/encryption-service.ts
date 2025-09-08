import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV = process.env.ENCRYPTION_IV;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY environment variable must be set and be 32 characters long for aes-256-cbc.');
}

if (!IV || IV.length !== 16) {
    throw new Error('ENCRYPTION_IV environment variable must be set and be 16 characters long.');
}

export class EncryptionService {
  /**
   * Encrypts a plain text string.
   */
  static encrypt(text: string): string {
    const key = Buffer.from(ENCRYPTION_KEY, 'utf-8');
    const iv = Buffer.from(IV, 'utf-8');

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypts a hex-encoded encrypted string.
   */
  static decrypt(encryptedText: string): string {
    try {
        const key = Buffer.from(ENCRYPTION_KEY, 'utf-8');
        const iv = Buffer.from(IV, 'utf-8');

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption failed. Returning original text.', error);
        return encryptedText;
    }
  }
}
