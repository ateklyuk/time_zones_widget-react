export type Config = {
    CLIENT_ID: string,
    CLIENT_SECRET: string,
    REDIRECT_URI: string,
    SUB_DOMAIN: string
    PORT: number,
    DB_URL: string,
    WIDGET_CONTROLLER_URL: string
}

export type ErrData = {
    config: {
        headers: {
            Authorization: string
        }
    },
    response: {
        data: {
            status: string | number,
            title: string
        },
        request: {
            host: string,
            _header: string
        },
    }
}
export type LoginRequest = {
    query: {
        referer: string,
        code: string,
        client_id: string
    }
}
export type StatusRequest = {
    query: {
        subdomain: string
    }
}
export type CodesRequest = {
    query: {}
}

export type LogoutRequest = {
    query: {
        account_id: number
        client_id: string
    }
}
export type Token = {
    token_type: string,
    expires_in: number,
    access_token: string,
    refresh_token: string

}

export type GetQuery = {
    body: {
        account: {
            subdomain: string,
            id: string,
        }
    }
}

export type FileData = {
    authorization_code?: string,
    id?: number,
    subdomain?: string,
    token_type: string,
    expires_in: number,
    access_token: string,
    refresh_token: string,
    is_installed?: boolean
}
export type TestArgs = {
    accountId: number;
    subdomain: string;
    userId: number
}