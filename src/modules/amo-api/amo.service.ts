import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {LoggerService} from "../../core/logger/logger.service";
import axios from "axios";
import {Config} from "../../core/config";
import {AuthTypes} from "../../core/consts/consts";
import {TokensResponse} from "../../core/amoTypes";

@Injectable()
export class AmoApiService {
    constructor(
        private readonly logger: LoggerService
    ) {}
    public async requestAccessToken(
        subdomain: string,
        code: string,
    ): Promise<TokensResponse> {
        const loggerContext = `${AmoApiService.name}/${this.requestAccessToken.name}`;
        try {
            const { data: tokens } = await axios.post<TokensResponse>(
                `https://${subdomain}.amocrm.ru/oauth2/access_token`,
                {
                    client_id: Config.client_id,
                    client_secret: Config.client_secret,
                    grant_type: AuthTypes.Auth,
                    code,
                    redirect_uri: Config.redirect_uri
                },
                {
                    headers: {
                        'Accept-encoding': 'utf-8',
                    },
                },
            );
            return tokens;
        } catch (error) {
            this.logger.error(error, loggerContext);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    public async refreshAccessToken(
        subdomain: string,
        refreshToken: string,
    ): Promise<TokensResponse> {
        const loggerContext = `${AmoApiService.name}/${this.refreshAccessToken.name}`;

        try {
            const { data: tokens } = await axios.post<TokensResponse>(
                `https://${subdomain}.amocrm.ru/oauth2/access_token`,
                {
                    client_id: Config.client_id,
                    client_secret: Config.client_secret,
                    grant_type: AuthTypes.Refresh,
                    refresh_token: refreshToken,
                },
            );

            return tokens;
        } catch (error) {
            this.logger.error(error, loggerContext);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
