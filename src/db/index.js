import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connection = async () => {
    try {
        const connectionInfo = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(connectionInfo);
        console.log(`Mongo DB Coneect !! DB Host ${connectionInfo.connection.host}`);
        
    } catch (error) {
        console.error( `DB Connection Failed`, error)
        process.exit(1)
    }
}

export default connection