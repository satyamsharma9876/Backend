import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false})// refresh token ko db me save kr rhe h yha pe
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler( async (req, res) => {
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
    // }or we can use some method so that is any fiels empty throw error

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
    const avatarLoacalPath = req.files?.avatar?.[0]?.path;
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
       
    //step7: remove password & refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "// -ve sign for ki ye ye fields nhi chaiye
    )
    
    //checking ki user aya ya nhi
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while regestering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

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
        httpOnly: true,
        secure: true
      }

      return res
      .status(200)
      .cookie("accessToken",accessToken, options)
      .cookie("refreshToken",refreshToken, options)
      .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
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
            $set: {
                refreshToken: undefined
            }
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
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken// req.body b/c may be user useing mobile phone, req.cookies for laptop

    if(!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
    
    try {
        // verification of incomingRefreshToken token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        
        // taking info from mongoDB by using _id
        const user = await User.findById(decodedToken?._id)
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
    
       const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {access, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {// we kept in try catch for safty purpose b/c if any error come in decoded or User.findById
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }


})

export {
     registerUser,
     loginUser,
     logoutUser,
     refreshAccessToken,
 } 

