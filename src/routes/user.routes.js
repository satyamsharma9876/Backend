import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";// yha ye import { registerUser } tbhi le skte h jb exp def na ho rha ho 


const router = Router()

router.route("/register").post(registerUser)
//router.route("/login").post(login)

export default router

