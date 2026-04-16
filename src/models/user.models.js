import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema(// id khud hi aajata h to id ki koi chinta nhi
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true// for enabling searching field
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName:{
            type: String,
            required: true,
            trim: true,
            index:true
        },
        avatar:{
            type: String, // cloudinary url it is a service like AWS in which we can upload files,vioes & get url
            required: true,
        },
        coverImage: {
            type: String,// cloudinary url
        },
        watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "video"
        }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type:String
        }
    },{
        timestamps: true
    }
)

// this following login will encrypt the password 
userSchema.pre("save", async function() {
    if(!this.isModified("password")) return ;
    this.password = await bcrypt.hash(this.password, 10)// isme bhi time lagega to use await
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)// return t or f
}

userSchema.methods.generateAccessToken = function(){//Ye JWT token banata hai using jsonwebtoke & for authentication purpose,Login ke baad client ko milta hai, or Har request me bhejta hai & Ye short lived hote h
  return jwt.sign(// directly ret krdia b/c generateToken krne me time ni lgta so we not use async await
        {
            _id: this.id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){//long term token & for session maintain, access token expire hone pe new token generate karega
     return jwt.sign(// directly ret krdia b/c generateToken krne me time ni lgta so we not use async await
        {
            _id: this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)

