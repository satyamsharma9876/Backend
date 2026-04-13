import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'// yha hmne userRouter ye manchaha naam tbhi de skte h jb export def ho rha ho jo ki ho rha h


//routes declaration
app.use("/api/v1/users", userRouter)

//http://localhost:8000/api.v1/users/register....firstwe willgo to /api/v1/users then userRouter activates then if/register then registerUser called
//  then ../controllers/user.controller.js" me registerUser message:ok prinkt krega
export { app }


