import axios from "axios";
import {config} from "../config";
import {getUserLogger, mainLogger} from "../logger";
import ApiService from "./apiService";
import Login from "../models/login";
import moment from "moment/moment";
import fs from "fs";

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
        await api.getAccessToken().then(async (token) => {
            const tokenData = token
            logger.debug(`Авторизация при установке виджета для ${subDomain} прошла успешно`)
            const account = await api.getAccountData([]);
            const accountId = account.id;
            const loginData = {
                accountId: accountId,
                widgetUserSubdomain: subDomain,
                paid: false,
                installed: true,
                testPeriod: true,
                startUsingDate: moment().format().slice(0, 10),
                finishUsingDate: moment().add(14, "days").format().slice(0, 10),
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token
            }
            await Login.findOneAndUpdate({ accountId: accountId}, loginData, {upsert: true})
                .then(() => logger.debug("Данные о пользователе были добавлены в базу данных виджета"))
                .catch((err) => logger.debug("Произошла ошибка добавления данных в БД ", err));
        })
            .catch((err) => logger.debug("Ошибка авторизации при установке виджета ", subDomain, err));
        const [searchingUser] = await Login.find({widgetUserSubdomain: subDomain})
        await this.makeRedirect(`${config.WIDGET_CONTROLLER_URL}/informer`, {
            client_uuid: integrationId,
            account_id: searchingUser.accountId
        })
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
