require('dotenv').config();
const express = require("express");
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = require("./models/userSchema");

const mongourl = process.env.DATA_BASE_URL;
const salts = process.env.SALTS;
const PORT = process.env.PORT || 3000;


const app = express();
app.use(express.json());

app.post("/register",async(req,res)=>{
    try {
        const {fName,email,lName,password} = req.body;

        const alreadyRegistered = await userSchema.findOne({
            email
        });
        // add to db

        if(alreadyRegistered){
            res.status(500).json({
                msg:"email already exists"
            });
            return;
        }
        // console.log(salts);
        const hash = await bcrypt.hash(password,parseInt(salts));
        
        const user = await userSchema.create({
            First_name:fName,
            Last_name:lName,
            email,
            password:hash
        });

        const token = jwt.sign({
            userId:user._id,
            email:user.email
        },process.env.JWT_TOKEN);
        

        return res.status(200).json({
            success:true,
            mess : "User registered successfully",
            token: `Bearer_${token}`,
            name:user.name
        });
    } catch (error) {
        console.error("Error during signup",error);
        return res.status(500).json({
            success: false,
            mess: "Error during user creation",
            error: error.message,
        })
    }
});
app.post("/login",async(req,res)=>{
    try {
        const {email,password} = req.body;
        
        const user = await userSchema.findOne({email}).select('password');

        if(!user){
            return res.status(404).json({
                msg: "Can't find an account associatd to this email address"
            });
        }

        const matchPassword = await bcrypt.compare(password,user.password)

        if(!matchPassword){
            return res.status(404).json({
               msg: "Password is incorrect" 
            });
        }
        console.log(user);
        // find in db

        const token = jwt.sign({
            userId:user._id,
            email
        },process.env.JWT_TOKEN);
        

        res.status(200).json({
            msg:"Logged in successfully",
            token:`Bearer_${token}`
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

dbConnect();