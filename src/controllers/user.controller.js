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
    console.log("email:", email);
    

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
    const existedUser = User.findOne({
        $or: [{ username },{ email }]
    })
    //console.log(existedUser);
    
    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //step 4: check for images, check for avatar
    const avatarLoacalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLoacalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // step 5: upload them to cloudinary 
    const avatar = await uploadOnCloudinary(avatarLoacalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // checking ki avatar cloundnary pe properly gya h ki nhi
    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
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
    
    //step7: remove password & refresh oken field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "// - sign for ki ye ye fields nhi chaiye
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


