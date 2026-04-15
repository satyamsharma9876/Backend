import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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
    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    console.log(existedUser);// null if email or username is unique
    
    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //console.log(req.files); //alot of values came
    
    //step 4: check for images, check for avatar
    const avatarLoacalPath = req.files?.avatar?.[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    // sol without is we r not using coverImage?.[0]
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
     console.log(avatar);//file is uploaded on cloudinary  http://res.cloudinary.com/dixqozsxt/image/upload/v1776184966/tkba8qb5khw4secasyaw.jpg
     console.log(coverImage);//file is uploaded on cloudinary  http://res.cloudinary.com/dixqozsxt/image/upload/v1776184967/bi6nohtgqfkeeymn5kqk.jpg
     
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

export {
     registerUser,
 } 

