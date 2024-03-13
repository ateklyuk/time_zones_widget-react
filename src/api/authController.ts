import { LoginRequest, LogoutRequest } from "../types";
import { Response } from "express";
import authService from "./authService";

export default new class AuthController {
    public login = async (req: LoginRequest, res: Response): Promise<Response> => {
        try {
            const { client_id: integrationId, referer: referer, code: authCode } = req.query;
            await authService.loginHandler(integrationId, referer, authCode)
            return res.status(200).json({message: "Токен получен"})
        } catch(e) {
            return res.status(400).json({ message: "Login error." })
        }
    }
    public delete = async (req: LogoutRequest, res: Response): Promise<Response> => {
        try {
            const account_id = req.query.account_id
            const client_id = req.query.client_id
            await authService.deleteHandler(account_id, client_id)
            return res.status(200).json({message: "Токен удален"})
        } catch (e) {
            return res.status(400).json({message: "Logout error.", body: e})
        }
    }
}