import { Client } from '../../core/models/client';

export abstract class ClientHandler {
    public abstract create(appName: string, redirectUrl: string, appDescription?: string): Promise<Client>;
    public abstract getClientById(clientId: string): Client | undefined;
    public abstract hasClient(clientId: string): boolean;
    public abstract setClientSecret(clientId: string, clientSecret: string): Promise<void>;
    public abstract getAllClients(): Client[];
}
