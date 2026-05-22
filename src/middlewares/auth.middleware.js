import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js";

//is authmiddelware ka naam verifyJWT h
export const verifyJWT = asyncHandler(async(req, _ , next) => {// _ ke jagah res tha but vo use ni horha tha to _ likhe, next=> agle middleware/controller pr jane k liye
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")// 
        //browser cookies me accessToken pda h to use lelo kyuki user login h to uske paas accessToken hoga || Authorization header padho & Bearer hatakr sirf actualToken nikal do
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)//JWT token asli h ya fake h Secret key se verify kro, if token corrct decodedToken me data mil jayega
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")//mtlb decodedToekn se userid nikalo mongoDb se or database me us user ko khojo
    
        if(!user){
            //next_video: discuss about frontend
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;//req me ek naya object aad kr rhe h user
        next()//agle controller pr bhej do taki aage access mil sake
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})


