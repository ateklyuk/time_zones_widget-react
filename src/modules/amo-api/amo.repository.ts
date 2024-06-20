import { Injectable } from '@nestjs/common';
import axios from "axios";
import {AuthChecker} from "./authChecker.decorator";
import {AccountResponse} from "../../core/amoTypes";

@Injectable()
export class AmoApiRepository {
    @AuthChecker()
    public async getAccountData(subdomain: string, accessToken: string) {
        const {data: response} = await axios.get<AccountResponse>(`https://${subdomain}.amocrm.ru/api/v4/account`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response;
    };
}
