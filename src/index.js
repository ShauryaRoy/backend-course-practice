import connectDB from "./db/index.js";
import dotenv from "dotenv";
import express from "express";
import { app } from "./app.js"
// const app = express()
dotenv.config({
    path: './env'
})




connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Application connected on port: ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log(`This is the error.. mongodb connection failed `, error)
    })













/*import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";

const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/ ${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERror:  ", error);
            throw error
        })
        app.listen(`${process.env.PORT}`, () => {
            console.log(`The is running on port ${process.env.PORT}`)
        })
    } catch {
        console.error("Error: ", error)
    }
})
*/
