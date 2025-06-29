import dotenv from "dotenv"
import connection from "./db/index.js";
import { app } from "./app.js";
import { port } from "./constants.js";

dotenv.config()

connection()
.then( () => {
    app.listen(port, () => {
        console.log(`Serever running at port : ${port}`);    
    })
})
.catch((error) => {
    console.log(`DB Connection Failed ${error}`);
    
})