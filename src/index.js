import dotenv from "dotenv"
//require('dotenv').config({path: './env'})// it will also work but it breks the continuity of code

// import 'dotenv/config'


// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";


// approch 2
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
})

// this connectDB() will return promise in db in index.js it is Asynchronus method so it'll return promise
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
        
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!!", err);

})




/*Approach 1, here we used iife to immediately execute fun, try catch and if db is i another continent so we used async await 
Approach 2, write all code in diff file in DB folder and import that fun in this index file
import express from "express"
const app = express()

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error           
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is Listening on port ${process.env.PORT}`);
            
        })

    } catch (error) {
        console.error("ERROR: ",error)
        throw error
    }
})()

*/

