const mongoose = require('mongoose');
const mongourl = process.env.DATA_BASE_URL;
require("dotenv").config()

const dbConnect =async()=>{
    try{
        // console.log(mongourl);
       await  mongoose.connect(mongourl)

       console.log("connected to db");
    }
    catch(e){
        console.log("error in connecting to the  database ", e.message);
    }
}

module.exports = dbConnect;