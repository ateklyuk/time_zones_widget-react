const express = require("express");
const cors = require("cors");
const moment = require("moment");
const mongoose = require("mongoose");
const fs = require("fs")
const TZ_prefixes = require("./models/Timezones");
const Login = require('./models/login');
const Api = require("./api"); 
const config = require("./config")
const app = express();
const {
    mainLogger,
    getUserLogger
} = require("./logger");
const axios = require("axios");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const getClearPhoneNumber = (tel) => {
    return tel ? tel.split("").filter(item => new RegExp(/\d/).test(item)).join("") : undefined; 
}

const getClearNumberByCountry = (tel) => {
    let clearNumber = getClearPhoneNumber(tel);
    if (clearNumber.slice(0, 2) === "87") {
      clearNumber = `7${clearNumber.slice(1)}`; 
      return clearNumber; 
    }

    if (clearNumber.slice(0, 3) === "374" || clearNumber.slice(0, 3) === "373") {
        return clearNumber
    }

    if ((clearNumber.slice(0, 2) !== "77" 
    || clearNumber.slice(0, 1) === "8" 
    || clearNumber.slice(0, 2) === "89")
    && (clearNumber.length === 11)) {
        return clearNumber.slice(1) 
    }
    if (clearNumber[0] === "7" && clearNumber.length === 10) {
      clearNumber = `7${clearNumber}`;  
      return clearNumber; 
    }

    return clearNumber; 
}

const searchPrefix = async (number) => {
    let prefixResult = await TZ_prefixes.find({prefix: number});
    if (number.length === 12) {
        prefixResult = await TZ_prefixes.find({prefix: number.slice(0, 3)});
    }
    if (!prefixResult.length && number.length > 2) {
        const shortNumber = number.slice(0, number.length - 1)
        prefixResult = await searchPrefix(shortNumber); 
    }
    return prefixResult; 
}
const makeRedirect = async (url, queryParams) => {
    return axios.get(url, {params: { ...queryParams }});
};

const state = {
    widgetUsers: {}
}

app.get("/login", async (req, res) => {
    try {
        let { client_id: integrationId, referer: subDomain, code: authCode } = req.query;
        subDomain = subDomain.split('.', 1)[0]
        const logger = getUserLogger(subDomain);
        logger.debug("Got request for widget installation");
        const api = new Api(subDomain, authCode);
        const [searchingUser] = await Login.find({ widgetUserSubdomain: subDomain })
        await api.getAccessToken()
            .then(() => logger.debug(`Авторизация при установке виджета для ${subDomain} прошла успешно`))
            .catch((err) => logger.debug("Ошибка авторизации при установке виджета ", subDomain, err.data));
        if (!state.widgetUsers[subDomain]) {
            const account = await api.getAccountData();
            const accountId = account.id;
            logger.debug(accountId)
            state.widgetUsers[subDomain] = {
                "startUsingDate": moment().format().slice(0, 10),
                "finishUsingDate": moment().add(14, "days").format().slice(0, 10),
                "paid": false,
                "installed": true,
                "testPeriod": true
            }
            await Login.insertMany({
                accountId: accountId,
                widgetUserSubdomain: subDomain,
                paid: state.widgetUsers[subDomain].paid,
                installed: state.widgetUsers[subDomain].installed,
                testPeriod: state.widgetUsers[subDomain].testPeriod,
                startUsingDate: state.widgetUsers[subDomain].startUsingDate,
                finishUsingDate: state.widgetUsers[subDomain].finishUsingDate
            })
                .then(() => logger.debug("Данные о пользователе были добавлены в базу данных виджета"))
                .catch((err) => logger.debug("Произошла ошибка добавления данных в БД ", err));
        } else {
            state.widgetUsers[subDomain].installed = true;
            await Login.updateOne({ widgetUserSubdomain: subDomain },
                {
                    $set: { 
                        installed: state.widgetUsers[subDomain].installed,
                    }
                }
            )
                .then(() => logger.debug("Данные о пользователе были обновлены в базе данных виджета"))
                .catch((err) => logger.debug("Произошла ошибка обновления данных в БД ", err));
        }

        await makeRedirect(`${config.WIDGET_CONTROLLER_URL}/informer`, { client_uuid: integrationId, account_id: searchingUser.accountId })
    } catch(e) {
        console.log(e);
        res.status(400).json({ message: "Login error." })
    }
})
app.get('/delete', async (req, res) => {
    try {
        const accountId = Number(req.query.account_id);
        const [ clientAccountData ] = await Login.find({ accountId });
        const subDomain = clientAccountData.widgetUserSubdomain;
        const AMO_TOKEN_PATH = `./authclients/${subDomain}_amo_token.json`;
        const logger = getUserLogger(subDomain);
        
        fs.unlinkSync(AMO_TOKEN_PATH);
        
        state.widgetUsers[subDomain].installed = false;
        Login.updateOne({ widgetUserSubdomain: subDomain }, {
            $set: {
                installed: state.widgetUsers[subDomain].installed,
            },
        })
            .then(() => logger.debug("Данные о пользователе были обновлены в базе данных виджета"))
            .catch((err) => logger.debug("Произошла ошибка обновления данных в БД ", err));
        logger.debug("Виджет был удалён из аккаунта");
        let { client_id: integrationId } = req.query;
        const [searchingUser] = await Login.find({ widgetUserSubdomain: subDomain })
        await makeRedirect(`${config.WIDGET_CONTROLLER_URL}/del`, { client_uuid: integrationId, account_id: searchingUser.accountId })
        res.status(200);
    } catch(e) {
        console.log(e);
        res.status(400).json({ message: "Login error.", body: e })
    }
});

app.get('/status', async (req, res) => {
    const subdomain = req.query.subdomain;
    const logger = getUserLogger(subdomain);
    const [searchingUser] = await Login.find({ widgetUserSubdomain: subdomain })
    
    if (searchingUser && subdomain) {
        if (searchingUser.testPeriod === true) {
            return res.status(200).json({
                response: 'trial',
                paid: searchingUser.paid,
                testPeriod: searchingUser.testPeriod,
                startUsingDate: searchingUser.startUsingDate,
                finishUsingDate: searchingUser.finishUsingDate
            })
        }
        const isSubscribe = new Date(searchingUser.finishUsingDate).getTime() - new Date(moment().format().slice(0, 10)).getTime();
        if (isSubscribe > 0) {
            return res.status(200).json({
                response: 'paid',
                paid: searchingUser.paid,
                testPeriod: searchingUser.testPeriod,
                startUsingDate: searchingUser.startUsingDate,
                finishUsingDate: searchingUser.finishUsingDate
            })
        } else {
            if (searchingUser.paid) {
                state.widgetUsers[subdomain].paid = false;
                state.widgetUsers[subdomain].testPeriod = false;
                Login.updateOne({ widgetUserSubdomain: subdomain }, {
                    $set: {
                        paid: state.widgetUsers[subdomain].paid,
                        testPeriod: state.widgetUsers[subdomain].testPeriod
                    },
                })
                    .then(() => logger.debug("Статус оплаты subdomain: " + subdomain + " изменен на false"))
                    .then(() => res.status(200).json({
                        response: 'notPaid',
                        paid: searchingUser.paid,
                        testPeriod: searchingUser.testPeriod,
                        startUsingDate: searchingUser.startUsingDate,
                        finishUsingDate: searchingUser.finishUsingDate
                    }))
                    .catch((err) => logger.debug("Произошла ошибка обновления данных в БД ", err));
                return
            }
            return res.status(200).json({
                response: 'notPaid',
                paid: searchingUser.paid,
                testPeriod: searchingUser.testPeriod,
                startUsingDate: searchingUser.startUsingDate,
                finishUsingDate: searchingUser.finishUsingDate
            })
        }
    } else {
        return res.status(200).json({
            response: 'userNotFound'
        })
    }
})

app.get("/codes", async (req, res) => {
    const phoneNumbers = Object.keys(req.query);
    const clearNumbers = phoneNumbers.map(number => {
        if (number[0] === " ") {
            number = `+${number.slice(1)}`; 
        }
        return {
            numberRow: number,
            clearNumber: getClearNumberByCountry(number)
        }
    })
    const response = []; 
    for (let i = 0; i < clearNumbers.length; i++) {
        const targetPrefix = await searchPrefix(clearNumbers[i].clearNumber)
        if (targetPrefix.length > 0) {
            const result = {
                phone: clearNumbers[i].numberRow,
                prefix: targetPrefix[0].prefix,
                operator: targetPrefix[0].operator,
                region: targetPrefix[0].region,
                time_zone: targetPrefix[0].time_zone,
                time_zone_GMT: targetPrefix[0].time_zone_GMT,
            };
            response.push(result); 
        }
    }
    mainLogger.debug(response)
    res.send(response)
})

app.get("/ping", (req, res) => {
    res.send("pong " + Date.now())
})

const URI_CONNECTION = "mongodb://127.0.0.1:27017/prefixes"
const CONNECTION_OPTIONS = {
    maxPoolSize: 10,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

app.listen(config.PORT, async () => {
    mongoose.connect(URI_CONNECTION, CONNECTION_OPTIONS)
        .then(() => mainLogger.debug("Database connection has been successful"))
        .catch((err) => mainLogger.debug("Error connecting to database", err))
    mainLogger.debug(`Server has been started on port ${config.PORT}`);
});
