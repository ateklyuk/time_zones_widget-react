import {CodesRequest, StatusRequest} from "../types";
import {Response} from "express";
import accountService from "./accountService";

export default new class AccountController {
    public status = async (req: StatusRequest, res: Response): Promise<void> => {
        const subdomain = req.query.subdomain;
        await accountService.statusHandler(subdomain, res)
    }
    public codes = async (req: CodesRequest, res: Response): Promise<void> => {
        const phoneNumbers = Object.keys(req.query);
        await accountService.codeHandler(phoneNumbers, res)

    }
}