import fs from 'fs';

import { Config } from '../../config';
import { KeyException } from '../../core/exceptions/key-exception';
import { KeyHandler } from '../interfaces/key-handler';
import { Logger } from './logger';

const AUTH_DEV_KEY = 'auth-dev-key';

export class KeyService extends KeyHandler {
    protected tokenKey = '';
    protected cookieKey = '';

    public constructor() {
        super();

        // Load key files early to detect missing ones
        this.loadKeys();
    }

    public getCookieKey(): string {
        return this.cookieKey;
    }

    public getTokenKey(): string {
        return this.tokenKey;
    }

    private loadKeys(): void {
        Logger.debug('KeyService.loadKeys -- is in dev-mode:', Config.isDevMode());
        if (Config.isDevMode()) {
            this.tokenKey = AUTH_DEV_KEY;
            this.cookieKey = AUTH_DEV_KEY;
        } else {
            const tokenKeyPath = '/run/secrets/auth_token_key';
            this.tokenKey = this.readFile(tokenKeyPath);
            if (!this.tokenKey) {
                throw new KeyException(`No AUTH_TOKEN_KEY defined in ${tokenKeyPath}`);
            }
            const cookieKeyPath = '/run/secrets/auth_cookie_key';
            this.cookieKey = this.readFile(cookieKeyPath);
            if (!this.cookieKey) {
                throw new KeyException(`No AUTH_COOKIE_KEY defined in ${cookieKeyPath}`);
            }
        }
    }

    private readFile(path: string): string {
        return fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
    }
}
