import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose"


const generateAccessAndRefreshTokens = async(userId) => {
      //userId → function call
      // ↓
      //DB से user
     //  ↓
      //accessToken generate
      // ↓
      //refreshToken generate
      // ↓
      //refreshToken DB में save
      // ↓
      //return tokens
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken// in DB current valid refresh token store is saved
        await user.save({ validateBeforeSave: false})// normally mongoose validatin check krta hai, yha false means validation skip kro(fast save)
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler( async (req, res) => {// asyncHAandler handles error
    // steps for register user- get user details from frontend
    // check validation eg email shi formate me h ki nhi
    // check if user already exist: by cheking if email or usrname unique or not
    // check for images, check for avatar
    // if they present upload them on cloudinary , also check avatar upload hua ya nhi
    // create user objct b/c in mongodb there is nosql databases so most of time obj hi banaye jate h- then, create entry in db
    // remove password & refresh oken field from response
    // chek response aya h ki nhi means user create hua h ki nhi
    // return response

    const {fullName, email, username, password } = req.body// it can only handle data coming in json formate, cant handle files
    console.log("email:", email);//email: satyam@123.com
    //console.log(req.body);//  email,fullname, password, username with their values prinnted
    
    
    // step 2 : validation
    // if(fullName === "") {
    //     throw new ApiError(400, "error")
    // }or we can use some method so that if any fiels will empty then throw error

    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }// further more thing can be cheched like email contain @ or not


    // step 3
    const existedUser = await User.findOne({// it return the first entry of username or email in mongodb
        $or: [{ username },{ email }]       // & await used b/c db is in other continent
    })
    console.log(existedUser);// null if email or username is unique
    
    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //console.log(req.files); //alot of values came
    
    //step 4: check for images, check for avatar
    const avatarLoacalPath = req.files?.avatar?.[0]?.path;//[0] b/c multer array deta hai
    //const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    // sol without using coverImage?.[0]
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLoacalPath){
        throw new ApiError(400, "Avatar file is required")
    }
    console.log("avatarLocalPath:", avatarLoacalPath);//avatarLocalPath: public\temp\satyamimage.jpeg
    // step 5: upload them to cloudinary 
    const avatar = await uploadOnCloudinary(avatarLoacalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
     //console.log(avatar);// alot of details about avatar image printed
     //console.log(coverImage);// alot of details about avatar image printed
     
    // checking ki avatar cloundnary pe properly gya h ki nhi
    if(!avatar){
        throw new ApiError(400, "Avatar file is reequired")
    }

    // step 6: create user obj - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,// ye hua h already checked
        coverImage: coverImage?.url || "",// ternary operatr to check ki coverImage cloudinary pe upload hua h ki nhi
        email,
        password,
        username: username.toLowerCase()
    })
      // console.log(user);// username,email,fullName,avatar,coverImage,watchHistory,passwordd, creayedAt,updatedAt all with values printed
       
    //step7: remove sensitive fields like password & refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "// -ve sign for ki ye ye fields nhi chaiye 
    )
    
    //checking ki user aya ya nhi
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while regestering the user")
    }

    return res.status(201).json(//201 is HTTP status code means
        new ApiResponse(200, createdUser, "User registered successfully")
    )//json(...) client(postman) ko data send kr rha "new ApiResponse(200, data, message)"

})

const loginUser = asyncHandler(async (req, res) => {
    
      //steps..get data by req.body
      //get access by username or email
      //find whether the user exist in db or not
      //check the password corect or not
      //if password coreect...make access and refresh token, it will be done many times so make a seperate fun
      //send cookie
      
      //step1:get data by req.body
      const {email, username, password} = req.body
      //console.log("email", email);//email one@gmail.com
      //console.log(password)//12345678
      if(!username && !email) {
        throw new ApiError(400, "username or email is required")
      }
      
      //step3:find whether the user exist in db or not
      const user = await User.findOne({
        $or: [{username}, {email}]
      })
      // console.log(user);// _id,username,email,fullName,avatar,coverImage,watchHistory,passwordd, creayedAt,updatedAt,refreshToken all with values printed

      // agar user nhi mila to error sed kro
      if(!user) throw new ApiError(404,"User does not exist")

      //step4: check the password corect or not
      const isPasswordValid = await user.isPasswordCorrect(password)

      if(!isPasswordValid) throw new ApiError(401,"Invalid user credentials")

      //step5: if password coreect...make access and refresh token,  
      const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

      const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

      const options = {
        httpOnly: true,// JS cant access cookie
        secure: true //cookie will only go to https pr hi jayigi
      }

      return res
      .status(200)
      .cookie("accessToken",accessToken, options)
      .cookie("refreshToken",refreshToken, options)
      .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User loggedIn Successfully"
        )
      )   
})

const logoutUser = asyncHandler(async(req, res) => {
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {// this removes the field from document
                refreshToken: 1//agr hacker ke pass access token h to limited damage
            }// if ref Token h to bda risk so during logout delete refresh token
        },
        {
            new:true
        }
     )
     const options = {
        httpOnly: true,
        secure: true
    }

   
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))// {} koi data retun nhi krna
})

const refreshAccessToken = asyncHandler(async (req, res) => {
            //    Client → refresh token भेजता है
            //    ↓
            //    Backend verify करता है (jwt.verify)
            //     ↓
            //    DB से user निकालता है
            //     ↓
            //    token match check
            //     ↓
            //    नया access + refresh token generate
            //     ↓
            //    cookies update
            //     ↓
            //    response भेजता है
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken// token 2 jagah se aa skta hai..cookies se(browser) or body se(mobile / API client)

    if(!incomingRefreshToken) {//user login नहीं है / token expired / missing
        throw new ApiError(401, "unauthorized request")
    }
    
    try {
        // verification of incomingRefreshToken sent be client is done by banckend
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        //how JWT VERIFY WORKS- incomingRefreshToken aya ->split ->decode payload part->signature match check->expiry check->valid->decoded data return



        // taking info from mongoDB by using _id
        const user = await User.findById(decodedToken?._id)// mongodb se User fetch
        if(!user) {
            throw new ApiError(401, "Invaid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
             throw new ApiError(401, "Refresh Token is Expired or used")
        }
    
        const options = {
            httpOnly:true,
            secure: true
        }
    
       const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, 
                refreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {// we kept in try catch for safty purpose b/c if any error come in decoded or User.findById
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
   //  User request (old + new password)
   //   ↓
   //  verifyJWT (user identify)
   //   ↓
   //  DB से user
   //   ↓
   //  old password verify
   //   ↓
   // new password set
   //   ↓
   // hash + save
   //   ↓
   // success response

    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    //user.refreshToken = undefined //mentor not included but gpt saying to include
    await user.save({validateBeforeSave: false})//hashed password stored in DB

    return res
    .status(200)// why {} b/c it is sensitive info koi data return nhi krna
    .json(new ApiResponse(200, {}, "Password changed successfully"))

})

const getCurrentUser = asyncHandler(async(req, res) => {
    //Client request (/me या /current-user)
    // ↓
    // cookie में accessToken जाता है
    // ↓
   // verifyJWT चलता है
    // ↓
    // token decode → userId मिलता है
    //  ↓
    // DB से user fetch
    //  ↓
    // req.user में store
    //  ↓
    // controller → response भेजता है
    return res
    .status(200)
    .json(new ApiResponse(
        200, 
        req.user, 
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,// here we did optionally unwrap
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}

    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLoacalPath = req.file?.path

    if(!avatarLoacalPath){
        throw new ApiError(400, "Avatar file is missing")
    }
    
    //TODO: delete old image - hw
    const avatar = await uploadOnCloudinary(avatarLoacalPath)

    if(!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }
    // we have to update avatar field
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Image is updated Successfully"))
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage =await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url) throw new ApiError(400, "Error while uploading on avatar")
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new: true}
    ).select("-password")  
    
    return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage Updated Successfully"))
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if(!username?.trim()) {
        throw new ApiError(400, "username s missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase() 
            }
        },
        {
            $lookup:{// $lookup JOIN krta h
                from: "subscriptions",// jis field ko join krna hai uska naam yha likho
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"// jo muje follow krte h ya mere subscribers h unko maine yha naam diya "subscribers"
            }// ye hogyi hamari first pipeline jha pr hmne find krli no. of subscribers by using channel
        },//now is channel ne kitno ko subscribe krkr rakha hai is finded by subscribers below
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"//jinko maine subscribed kr rakha hai unko maine naam diya hai subscribedTo
            }
        },{
            $addFields: {// it does calculation
                subscribersCount: {
                    $size: "$subscribers"// $ is added b/c it is field
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if:{$in: [req.user?._id, "$subscribers.subscriber"]},// in check kr rha h ki user present h ya nhi
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {//cleanup
                fullName: 1,
                username: 1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage: 1,
                email:1
            }
        }

    ])

    if(!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "user channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                       $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        ]
                       } 
                    },
                    {
                        $addFields: {
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
           200, 
           user[0].watchHistory,
           "watch History Fetch Successfully"
        )
    )
})


export {
     registerUser,
     loginUser,
     logoutUser,
     refreshAccessToken,
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDetails,
     updateUserAvatar,
     updateUserCoverImage,
     getUserChannelProfile,
     getWatchHistory
 } 

