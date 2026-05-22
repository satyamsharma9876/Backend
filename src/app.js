import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()


// niche sb app.use middlewares hai
app.use(cors({// app.use tab use hota h jb aako koi middleware use krna hota h
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))//json data ya phir form data read/accept krne k liye, w/o it req.body= undefined
app.use(express.urlencoded({extended:true, limit: "16kb"}))// form data(text) ko jS obj me convert krta hai, url se data acccept krne ke liye
app.use(express.static("public"))//public folder को publicly accessible बना देता है
// eg public/temp/image.jpg ko tm browser me http://localhost:8000/temp/image.jpg se access kr skte ho
app.use(cookieParser())//cookies पढ़ने के लिए, server se cokkies access krne or unko set krne k liye use hota h


//routes import
import userRouter from './routes/user.routes.js'// yha hmne userRouter ye manchaha naam tbhi de skte h jb export def ho rha ho jo ki ho rha h


//routes declaration
// initially in chaideploy vale project me app.get() use kr rhe the but us samay hm  is tarh se router nhi export kr rhe the, hm app ke through yhi routes or controllers dono likh rhe the
//but yha hm router ko alag likh rhe h to usko lane k liye middleware lana padega so use app.use()
app.use("/api/v1/users", userRouter)// here v1 is version 1

//http://localhost:8000/api.v1/users/register....firstwe willgo to /api/v1/users then userRouter activates then if/register then registerUser called
//  then ../controllers/user.controller.js" me registerUser message:ok prinkt krega
export { app }

