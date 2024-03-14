import {getUserLogger, mainLogger} from "../logger";
import Login from "../models/login";
import moment from "moment";
import {Response} from "express";
import TZ_prefixes from "../models/Timezones";

export default new class AuthorizationService {
    private getClearPhoneNumber = (tel: string) => {
        return tel.split("").filter(item => new RegExp(/\d/).test(item)).join("");
    }

    private getClearNumberByCountry = (tel: string) => {
        let clearNumber = this.getClearPhoneNumber(tel);
        if (clearNumber.slice(0, 2) === "87") {
            clearNumber = `7${clearNumber.slice(1)}`;
            return clearNumber;
        }

        if (clearNumber.slice(0, 3) === "374" || clearNumber.slice(0, 3) === "373") {
            return clearNumber
        }

        if ((clearNumber?.slice(0, 2) !== "77"
                || clearNumber.slice(0, 1) === "8"
                || clearNumber.slice(0, 2) === "89")
            && (clearNumber.length === 11)) {
            return clearNumber.slice(1)
        }
        if (clearNumber?.length === 10 && clearNumber[0] === "7") {
            clearNumber = `7${clearNumber}`;
            return clearNumber;
        }

        return clearNumber;
    }

    private searchPrefix = async (number: string) => {
        let prefixResult = await TZ_prefixes.find({prefix: number});
        if (number.length === 12) {
            prefixResult = await TZ_prefixes.find({prefix: number.slice(0, 3)});
        }
        if (!prefixResult.length && number.length > 2) {
            const shortNumber = number.slice(0, number.length - 1)
            prefixResult = await this.searchPrefix(shortNumber);
        }
        return prefixResult;
    }
    public statusHandler = async (subdomain: string, res: Response) => {
        const logger = getUserLogger(subdomain);
        const [searchingUser] = await Login.find({widgetUserSubdomain: subdomain})
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
                    Login.updateOne({widgetUserSubdomain: subdomain}, {
                        $set: {
                            paid: false,
                            testPeriod: false
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
    }
    public codeHandler = async (phoneNumbers: string[], res: Response) => {
        const clearNumbers = phoneNumbers.map(number => {
            if (number[0] === " ") {
                number = `+${number.slice(1)}`;
            }
            return {
                numberRow: number,
                clearNumber: this.getClearNumberByCountry(number)
            }
        })
        const response = [];
        for (let i = 0; i < clearNumbers.length; i++) {
            const targetPrefix = await this.searchPrefix(clearNumbers[i].clearNumber)
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
    }
}