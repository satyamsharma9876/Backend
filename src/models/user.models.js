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
userSchema.pre("save", async function() {// it is middleware/hook automatically run hota h
    if(!this.isModified("password")) return ;//iif password not change then skip
    this.password = await bcrypt.hash(this.password, 10)// isme bhi time lagega to use await, yha plain passwrd hash ban rha h
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)// return t or f
}

// it is mongoose model method so har user obj ke pass ye fun h
userSchema.methods.generateAccessToken = function(){//jwt.sign() JWT token banata hai using jsonwebtoke & for authentication purpose,Login ke baad client ko milta hai, or Har request me bhejta hai & Ye short lived hote h
  return jwt.sign(// directly ret krdia b/c generateToken krne me time ni lgta so we not use async await
        {// ye 4 payload h jo token me jaiga
            _id: this.id,//JWT has 3 parts header, payload, signature
            email: this.email,// & JWT isn't encrypted only encoded in base64 so passwrod kabhi mtt dalna token me 
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,//it is used for sign, iske bina token verify ni hoga
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY//mtlb kitne din me expire hogauska info
        }
    )
}
userSchema.methods.generateRefreshToken = function(){//long term token & for session maintain, access token expire hone pe new token generate karega
     return jwt.sign(// directly ret krdia b/c generateToken krne me time ni lgta so we not use async await
        {
            _id: this.id,// sirf id rakha gya h, refToken rarely use hota h so jada data expose ni krna chate
        },
        process.env.REFRESH_TOKEN_SECRET,//for extra security
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)

