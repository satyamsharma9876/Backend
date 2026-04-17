import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()


// niche sb app.use middlewares hai
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))// json data read krne k liye, w/o it req.body= undefined
app.use(express.urlencoded({extended:true, limit: "16kb"}))// form data(text) ko jS obj me convert krta hai
app.use(express.static("public"))//public folder को publicly accessible बना देता है
// eg public/temp/image.jpg ko tm browser me http://localhost:8000/temp/image.jpg se access kr skte ho
app.use(cookieParser())//cookies पढ़ने के लिए


//routes import
import userRouter from './routes/user.routes.js'// yha hmne userRouter ye manchaha naam tbhi de skte h jb export def ho rha ho jo ki ho rha h


//routes declaration
app.use("/api/v1/users", userRouter)

//http://localhost:8000/api.v1/users/register....firstwe willgo to /api/v1/users then userRouter activates then if/register then registerUser called
//  then ../controllers/user.controller.js" me registerUser message:ok prinkt krega
export { app }


