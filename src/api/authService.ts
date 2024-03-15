import axios from "axios";
import {config} from "../config";
import {getUserLogger, mainLogger} from "../logger";
import ApiService from "./apiService";
import Login from "../models/login";
import moment from "moment"
import fs from "fs";
import {jwtDecode, JwtPayload} from 'jwt-decode'
import {DecodedToken} from "../types";

export default new class AuthorizationService {
    private makeRedirect = async (url: string, queryParams: {
        client_uuid: string,
        account_id: number
    }) => {
        return axios.get(url, {params: {...queryParams}});
    };
    public loginHandler = async (integrationId: string, referer: string, authCode: string): Promise<void> => {
        const subDomain = referer.split('.', 1)[0]
        const logger = getUserLogger(subDomain);
        logger.debug("Got request for widget installation");
        const api = new ApiService(subDomain, authCode);
        try {
            const token = await api.requestAccessToken()
            const decodedToken = jwtDecode<DecodedToken>(token.access_token)
            logger.debug(`Авторизация при установке виджета для ${subDomain} прошла успешно`)
            const accountId = decodedToken.account_id
            const loginData = {
                accountId: accountId,
                widgetUserSubdomain: subDomain,
                paid: false,
                installed: true,
                testPeriod: true,
                startUsingDate: moment().format().slice(0, 10),
                finishUsingDate: moment().add(14, "days").format().slice(0, 10),
                accessToken: token.access_token,
                refreshToken: token.refresh_token
            }
            try {
                await Login.findOneAndUpdate({ accountId: accountId}, loginData, {upsert: true})
                logger.debug("Данные о пользователе были добавлены в базу данных виджета")
            } catch (error) {
                logger.debug("Ошибка авторизации при установке виджета ", subDomain, error)
            }
            const [searchingUser] = await Login.find({widgetUserSubdomain: subDomain})

            await this.makeRedirect(`${config.WIDGET_CONTROLLER_URL}/informer`, {
                client_uuid: integrationId,
                account_id: searchingUser.accountId
            })
        } catch (error) {
            logger.debug("Ошибка авторизации при установке виджета ", subDomain, error)
        }
    }
    public deleteHandler = async (accountId: number, integrationId: string): Promise<void> => {
        const [clientAccountData] = await Login.find({accountId});
        const subDomain = clientAccountData.widgetUserSubdomain;
        const AMO_TOKEN_PATH = `./authclients/${subDomain}_amo_token.json`;
        const logger = getUserLogger(subDomain);

        fs.unlinkSync(AMO_TOKEN_PATH);

        Login.updateOne({widgetUserSubdomain: subDomain}, {
            $set: {
                installed: false,
            },
        })
            .then(() => logger.debug("Данные о пользователе были обновлены в базе данных виджета"))
            .catch((err) => logger.debug("Произошла ошибка обновления данных в БД ", err));
        logger.debug("Виджет был удалён из аккаунта");
        const [searchingUser] = await Login.find({widgetUserSubdomain: subDomain})
        await this.makeRedirect(`${config.WIDGET_CONTROLLER_URL}/del`, {
            client_uuid: integrationId,
            account_id: searchingUser.accountId
        })

    }
}
