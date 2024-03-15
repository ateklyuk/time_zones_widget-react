import {Config} from "./types";

export const config: Config = {
    // данные для api amocrm
    CLIENT_ID: "641929bf-5d31-4892-96aa-b86a84062963",
    CLIENT_SECRET: "QTCE4ZQQfsE35gN0mtR7G3GKWx3B8sK243YnbooP0Rw4Ua7r0ooGbAmGfPqNShRR",
    // AUTH_CODE живет 20 минут, при перезапуске скрипта нужно брать новый
    REDIRECT_URI: "https://3ee3ntzyt9km.share.zrok.io/login",
    SUB_DOMAIN: "ateklyuktech",
    // конфигурация сервера
    PORT: 2000,
    DB_URL: "mongodb://127.0.0.1:27017/prefixes",
    WIDGET_CONTROLLER_URL: 'https://vds2151841.my-ihor.ru',
}
