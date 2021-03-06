import { AuthHandler } from '../interfaces/auth-handler';
import { Inject, InjectService } from '../../util/di';
import { HashingHandler } from '../interfaces/hashing-handler';
import { HashingService } from './hashing-service';
import { Logger } from './logger';
import { SessionService } from './session-service';
import { Ticket, Token } from '../../core/ticket';
import { TicketHandler } from '../interfaces/ticket-handler';
import { TicketService } from './ticket-service';
import { UserHandler } from '../interfaces/user-handler';
import { UserService } from './user-service';
import { Validation } from '../interfaces/validation';

export class AuthService implements AuthHandler {
    @Inject(UserService)
    private userHandler: UserHandler;

    @Inject(TicketService)
    private ticketHandler: TicketHandler;

    @Inject(HashingService)
    private hashHandler: HashingHandler;

    @InjectService(SessionService)
    private sessionHandler: SessionService;

    public async login(username: string, password: string): Promise<Validation<Ticket>> {
        if (!username || !password) {
            return { isValid: false, message: 'Authentication failed! Username or password is not provided!' };
        }

        const result = await this.userHandler.getUserByCredentials(username, password);
        if (!result.result) {
            return { isValid: false, message: result.message };
        }

        return await this.ticketHandler.create(result.result);
    }

    public async whoAmI(cookieAsString: string): Promise<Validation<Ticket>> {
        Logger.debug(`whoAmI -- cookie: ${cookieAsString}`);
        const answer = await this.ticketHandler.refresh(cookieAsString);
        return answer;
    }

    public logout(token: Token): void {
        this.sessionHandler.clearSessionById(token.sessionId);
    }

    public async getListOfSessions(): Promise<string[]> {
        return await this.sessionHandler.getAllActiveSessions();
    }

    public async clearUserSessionById(sessionId: string): Promise<Validation<void>> {
        await this.sessionHandler.clearSessionById(sessionId);
        return { isValid: true, message: 'successful' };
    }

    public async clearAllSessionsExceptThemselves(sessionId: string): Promise<Validation<void>> {
        await this.sessionHandler.clearAllSessionsExceptThemselves(sessionId);
        return { isValid: true, message: 'successful' };
    }

    public toHash(input: string): string {
        return this.hashHandler.hash(input);
    }

    public isEquals(toHash: string, toCompare: string): boolean {
        return this.hashHandler.isEquals(toHash, toCompare);
    }
}
