import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"


//2 things when to talk with DB
//1. DB is in other continent
//2. data aane me time lgta h so use async await and try catch OR Promises if use async await


const connectDB = async () => {
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
       console.log(connectionInstance);// it is hw
       
    } catch (error) {
        console.log("MONGODB connection FAILED", error);
        process.exit(1)
    }
}

export default connectDB




