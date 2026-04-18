import { Router } from "express";
import {loginUser, 
       logoutUser, 
       registerUser, 
       refreshAccessToken,
       changeCurrentPassword,
       getCurrentUser,
       updateAccountDetails,
       updateUserAvatar,
       updateUserCoverImage,
       getUserChannelProfile,
       getWatchHistory,
} from "../controllers/user.controller.js";// yha ye import { registerUser } tbhi le skte h jb exp def na ho rha ho 
import {upload} from "../middlewares/multter.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(// we choose fields b/c of alot files to upload
    upload.fields([// this is the middleware, ye file ko save krta hai like public/temp/filename.jpg
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
// b/c for protected routes like logout, currentuser, updateuser, update profile, change passwrd verifyJWT required ✅
// & for public routes register , login not needed
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)// .get used b/c here data nhi send ho rha h
router.route("/update-account").patch(verifyJWT, updateAccountDetails)// .patch b/c if post used then all details will get updated

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)// upload.single("avatar") is second middleware

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile) //here we r getting data from parms so username hi rakh skte h b/c in user.controller it is username
router.route("/history").get(verifyJWT, getWatchHistory)


export default router

