import {Router} from "express";
import AuthController from "../api/authController";
import AccountController from "../api/accountController";


const router = Router()

router.get("/login", AuthController.login)
router.get("/delete", AuthController.delete)
router.get("/status", AccountController.status)
router.get("/codes", AccountController.codes)
router.get("/ping", (req, res) => {
     res.send("pong " + Date.now())
})

export default router