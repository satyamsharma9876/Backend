import { Router } from "express";
import {loginUser, logoutUser, registerUser, refreshAccessToken} from "../controllers/user.controller.js";// yha ye import { registerUser } tbhi le skte h jb exp def na ho rha ho 
import {upload} from "../middlewares/multter.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


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

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)// we injected middleware bef call logoutUser
router.route("/refresh-token").post(refreshAccessToken)


export default router

