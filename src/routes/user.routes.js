import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";// yha ye import { registerUser } tbhi le skte h jb exp def na ho rha ho 
import {upload} from "../middlewares/multter.middleware.js"

const router = Router()

router.route("/register").post(// we choose fields b/c of alot files to upload
    upload.fields([// this is the middleware
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)



//router.route("/login").post(login)

export default router

