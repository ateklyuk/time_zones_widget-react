import {Config} from "./types";

export const config: Config = {
    // данные для api amocrm
    CLIENT_ID: "48778ddf-2e8d-499a-abe0-28f59af0463e",
    CLIENT_SECRET: "12nbrpdyZXBRMO2a2YBFM627eRedrg5OmY9DgZxfhxxz5SDKuypwVaX8avb0tTaH",
    // AUTH_CODE живет 20 минут, при перезапуске скрипта нужно брать новый
    REDIRECT_URI: "https://4fd5-77-95-90-50.ngrok-free.app/login",
    SUB_DOMAIN: "ateklyuktech",
    // конфигурация сервера
    PORT: 2000,
    DB_URL: "mongodb://127.0.0.1:27017/prefixes",
    WIDGET_CONTROLLER_URL: 'https://vds2151841.my-ihor.ru',
}
