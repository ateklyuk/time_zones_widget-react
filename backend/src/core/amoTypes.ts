export type TokenData = {
    access_token: string;
    refresh_token: string;
};
export type TokensResponse = {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
};
export type AccountResponse = {
    id: number,
    subdomain: string
}