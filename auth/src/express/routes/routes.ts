import * as express from 'express';

import { Inject } from '../../util/di';
import { RouteHandler } from '../interfaces/route-handler';
import RouteService from '../middleware/route-service';
import TicketValidator from '../middleware/ticket-validator';
import { Validator } from '../interfaces/validator';

export default class Routes {
    private readonly EXTERNAL_URL_PREFIX = '/system/auth';
    private readonly INTERNAL_URL_PREFIX = '/internal/auth';
    private readonly SECURE_URL_PREFIX = '/secure';

    @Inject(TicketValidator)
    private validator: Validator;

    @Inject(RouteService)
    private routeHandler: RouteHandler;

    private app: express.Application;

    public constructor(app: express.Application) {
        this.app = app;
    }

    public initRoutes(): void {
        this.configRoutes();
        this.initPublicRoutes();
        this.initPrivateRoutes();
        this.initSecureRoutes();
        this.app.use((req, res) => this.routeHandler.notFound(req, res));
    }

    private configRoutes(): void {
        this.initValidation(this.getPublicSecureUrl('/*'));
        this.initValidation(this.getPrivateSecureUrl('/*'));
    }

    private initValidation(urlPrefix: string): void {
        this.app.all(urlPrefix, (request, response, next) => this.validator.validate(request, response, next));
    }

    private initPublicRoutes(): void {
        this.app.get(this.getPublicUrl('/'), (request, response) => this.routeHandler.index(request, response));
        this.app.post(this.getPublicUrl('/login'), (request, response) => this.routeHandler.login(request, response));
        this.app.post(this.getPublicUrl('/who-am-i'), (request, response) =>
            this.routeHandler.whoAmI(request, response)
        );
    }

    private initPrivateRoutes(): void {
        this.app.post(
            this.getPrivateUrl('/authenticate'),
            (request, response, next) => this.validator.validate(request, response, next),
            (request, response) => this.routeHandler.authenticate(request, response)
        );
        this.app.post(this.getPrivateUrl('/hash'), (request, response) => this.routeHandler.hash(request, response));
        this.app.post(this.getPrivateUrl('/is-equals'), (request, response) =>
            this.routeHandler.isEquals(request, response)
        );
    }

    private initSecureRoutes(): void {
        this.app.get(this.getPublicSecureUrl('/hello'), (request, response) =>
            this.routeHandler.secureIndex(request, response)
        );
        this.app.post(this.getPublicSecureUrl('/logout'), (request, response) =>
            this.routeHandler.logout(request, response)
        );
        this.app.get(this.getPublicSecureUrl('/list-sessions'), (request, response) =>
            this.routeHandler.getListOfSessions(request, response)
        );
        this.app.post(this.getPublicSecureUrl('/clear-all-sessions-except-themselves'), (request, response) =>
            this.routeHandler.clearAllSessionsExceptThemselves(request, response)
        );
        this.app.post(this.getPublicSecureUrl('/clear-session-by-id'), (request, response) =>
            this.routeHandler.clearUserSessionById(request, response)
        );
    }

    private getPrivateUrl(urlPath: string): string {
        return `${this.INTERNAL_URL_PREFIX}${urlPath}`;
    }

    private getPrivateSecureUrl(urlPath: string): string {
        return `${this.INTERNAL_URL_PREFIX}${this.SECURE_URL_PREFIX}${urlPath}`;
    }

    private getPublicUrl(urlPath: string): string {
        return `${this.EXTERNAL_URL_PREFIX}${urlPath}`;
    }

    private getPublicSecureUrl(urlPath: string): string {
        return `${this.EXTERNAL_URL_PREFIX}${this.SECURE_URL_PREFIX}${urlPath}`;
    }
}
