import axios from "axios";
import fs from "fs";
import {config} from "../config";
import {getUserLogger} from "../logger";
import {Logger} from "log4js";
import {Token} from "../types";


const LIMIT = 200;

export default class ApiService {
    private authCode: string;
    private logger: Logger
    private access_token: string | null = null;
    private refresh_token: string | null = null;
    private AMO_TOKEN_PATH: string
    private ROOT_PATH: string
    constructor(subDomain: string, authCode: string) {
        this.authCode = authCode;
        this.logger = getUserLogger(subDomain);

        this.AMO_TOKEN_PATH = `./authclients/${subDomain}_amo_token.json`;
        this.ROOT_PATH = `https://${subDomain}.amocrm.ru`;
    }

    private authChecker = <T, U>(request: (args: T) => Promise<U>): ((args: T) => Promise<U>) => {
        return (...args) => {
            if (!this.access_token) {
                return this.getAccessToken().then(() => this.authChecker(request)(...args));
            }
            return request(...args).catch((err) => {
                this.logger.error(err.response.data);
                const data = err.response.data;
                if ('validation-errors' in data) {
                    data['validation-errors'].forEach(({ errors }: {errors: Error[]}) => this.logger.error(errors))
                    this.logger.error('args', JSON.stringify(args, null, 2))
                }
                if (data.status == 401 && data.title === "Unauthorized") {
                    this.logger.debug("Нужно обновить токен");
                    return this.refreshToken().then(() => this.authChecker(request)(...args));
                }
                throw err
            });
        };
    };

    public requestAccessToken = (): Promise<Token> => {
        return axios
            .post(`${this.ROOT_PATH}/oauth2/access_token`, {
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                grant_type: "authorization_code",
                code: this.authCode,
                redirect_uri: config.REDIRECT_URI,
            })
            .then((res) => {
                this.logger.debug("Свежий токен получен");
                fs.writeFileSync(this.AMO_TOKEN_PATH, JSON.stringify(res.data));
                return res.data;
            })
            .catch((err) => {
                this.logger.error(err.response);
                throw err;
            });
    };

    public getAccessToken = async (): Promise<Token> => {
        try {
            const content = fs.readFileSync(this.AMO_TOKEN_PATH);
            const token = JSON.parse(content.toString());
            this.access_token = token.access_token;
            this.refresh_token = token.refresh_token;
            return Promise.resolve(token);
        } catch (error) {
            this.logger.error(`Ошибка при чтении файла ${this.AMO_TOKEN_PATH}`, error);
            this.logger.debug("Попытка заново получить токен");
            const token = await this.requestAccessToken();
            fs.writeFileSync(this.AMO_TOKEN_PATH, JSON.stringify(token));
            this.access_token = token.access_token;
            this.refresh_token = token.refresh_token;
            return Promise.resolve(token);
        }
    };

    public refreshToken = () => {
        return axios
            .post(`${this.ROOT_PATH}/oauth2/access_token`, {
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: this.refresh_token,
                redirect_uri: config.REDIRECT_URI,
            })
            .then((res) => {
                this.logger.debug("Токен успешно обновлен");
                const token = res.data;
                fs.writeFileSync(this.AMO_TOKEN_PATH, JSON.stringify(token));
                this.access_token = token.access_token;
                this.refresh_token = token.refresh_token;
                return token;
            })
            .catch((err) => {
                this.logger.error("Не удалось обновить токен");
                this.logger.error(err.response.data);
            });
    };

    public getAccountData = this.authChecker(() => {
        return axios.get(`${this.ROOT_PATH}/api/v4/account`, {
            headers: {
                Authorization: `Bearer ${this.access_token}`,
            },
        }).then((res) => res.data);
    });
}

//   this.getDeal = authChecker((id, withParam = []) => {
//     return axios
//       .get(
//         `${ROOT_PATH}/api/v4/leads/${id}?${querystring.encode({
//           with: withParam.join(","),
//         })}`,
//         {
//           headers: {
//             Authorization: `Bearer ${access_token}`,
//           },
//         }
//       )
//       .then((res) => res.data);
//   });
//
//   this.getDeals = authChecker(({ page = 1, limit = LIMIT, filters }) => {
//     const url = `${ROOT_PATH}/api/v4/leads?${querystring.stringify({
//       page,
//       limit,
//       with: ['contacts'],
//       ...filters,
//     })}`;
//
//     return axios
//       .get(url, {
//         headers: {
//           Authorization: `Bearer ${access_token}`,
//         },
//       })
//       .then((res) => {
//         return res.data ? res.data._embedded.leads : [];
//       });
//   });
//
//   this.updateDeals = authChecker((data) => {
//     return axios.patch(`${ROOT_PATH}/api/v4/leads`, [].concat(data), {
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//       },
//     });
//   });
//
//   this.getContacts = authChecker(({ page = 1, limit = LIMIT }) => {
//     const url = `${ROOT_PATH}/api/v4/contacts?${querystring.stringify({
//       page,
//       limit,
//       with: ['leads'],
//     })}`;
//     return axios
//       .get(url, {
//         headers: {
//           Authorization: `Bearer ${access_token}`,
//         },
//       })
//       .then((res) => {
//         return res.data ? res.data._embedded.contacts : [];
//       });
//   });
//
//   this.getContact = authChecker((id) => {
//     return axios
//       .get(`${ROOT_PATH}/api/v4/contacts/${id}?${querystring.stringify({
//         with: ['leads']
//       })}`, {
//         headers: {
//           Authorization: `Bearer ${access_token}`,
//         },
//       })
//       .then((res) => res.data);
//   });
//
//   this.updateContacts = authChecker((data) => {
//     return axios.patch(`${ROOT_PATH}/api/v4/contacts`, [].concat(data), {
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//       },
//     });
//   });
//
//   this.createContacts = authChecker((data) => {
//     return axios.post(`${ROOT_PATH}/api/v4/contacts`, [].concat(data), {
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//       },
//     });
//   });
//
//   this.createDeals = authChecker((data) => {
//     return axios.post(`${ROOT_PATH}/api/v4/leads`, [].concat(data), {
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//       },
//     });
//   });
//
//   this.addDealsComplex = authChecker((data) => {
//     return axios.post(`${ROOT_PATH}/api/v4/leads/complex`, [].concat(data), {
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//       },
//     });
//   });
//
//   this.getTasksByEntity = (entityId) => {
//     return authChecker(({ page = 1, limit = LIMIT }, id = entityId) => {
//       return axios
//         .get(`${ROOT_PATH}/api/v4/tasks?filter[entity_id]=${id}?${querystring.stringify({
//           page,
//           limit,
//         })}`,
//           {
//             headers: {
//               Authorization: `Bearer ${access_token}`,
//             },
//           })
//         .then((res) => res.data);
//     });
//   };
//
//   this.updateTask = authChecker((data) => {
//     const tasksData = [].concat(data);
//     return axios.patch(`${ROOT_PATH}/api/v4/tasks`, tasksData, {
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//       },
//     });
//   });
//
//   this.updateTaskComplex = authChecker((data) => {
//     return axios.patch(`${ROOT_PATH}/api/v4/tasks`, data, {
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//       },
//     });
//   });
//
//   this.createTasks = authChecker((data) => {
//     const tasksData = [].concat(data);
//     return axios.post(`${ROOT_PATH}/api/v4/tasks`, tasksData, {
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//       },
//     });
//   });
//
//   this.getPipeline = authChecker((pipelineId) => {
//     return axios
//       .get(`${ROOT_PATH}/api/v4/leads/pipelines/${pipelineId}`, {
//         headers: {
//           Authorization: `Bearer ${access_token}`,
//         },
//       })
//       .then((res) => res.data);
//   });
//
//   this.getStatus = authChecker(({ pipelineId, statusId }) => {
//     return axios
//       .get(
//         `${ROOT_PATH}/api/v4/leads/pipelines/${pipelineId}/statuses/${statusId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${access_token}`,
//           },
//         }
//       )
//       .then((res) => res.data);
//   });
//
//   this.getUser = authChecker((userId) => {
//     return axios
//       .get(`${ROOT_PATH}/api/v4/users/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${access_token}`,
//         },
//       })
//       .then((res) => res.data);
//   });
//
//   this.getUsers = authChecker(({ page = 1, limit = LIMIT }) => {
//     const url = `${ROOT_PATH}/api/v4/users?${querystring.stringify({
//       page,
//       limit,
//     })}`;
//     return axios
//       .get(url, {
//         headers: {
//           Authorization: `Bearer ${access_token}`,
//         },
//       })
//       .then((res) => {
//         return res.data ? res.data._embedded.users : [];
//       });
//   });
//
//   this.getCompany = authChecker((id, withParam = []) => {
//     return axios
//       .get(`${ROOT_PATH}/api/v4/companies/${id}?${querystring.stringify({
//         with: withParam.join(","),
//       })}`, {
//         headers: {
//           Authorization: `Bearer ${access_token}`,
//         },
//       })
//       .then((res) => res.data);
//   });
//
//   this.updateCompany = authChecker((data) => {
//     return axios.patch(`${ROOT_PATH}/api/v4/companies`, [].concat(data), {
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//       },
//     });
//   });
//
//   this.createUnsorted = authChecker((data) => {
//     return axios.post(`${ROOT_PATH}/api/v4/leads/unsorted/forms`, [].concat(data), {
//       headers: {
//         Authorization: `Bearer ${access_token}`,
//       },
//     })
//   });
// }
