import validator from 'validator' 
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

}


//Route for user login
const loginUser = async (req,res)=>{
      try{
        const {email, password} = req.body;
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(401).json({success:false, message: "Invalid credentials"});
        }
        //Checking password match
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({success:false, message: "Invalid credentials in passwords match"});
        }

        //if password match, generate token
        const token = createToken(user._id);
        res.json({success: true, token});




      }
      catch(error){
        res.status(500).json({success:false, message: "Server Error"});
      }

}

//Route for user registration

const registerUser = async (req,res)=>{
    try{
        const {name,email,password} = req.body;
        //checking user already exists or not
        const exists = await userModel.findOne({ email });
        if(exists){
            return res.status(400).json({success:false ,message: "User already exists"});
        } 

        //Validating emai format and strong password
        if(!validator.isEmail(email)){
            return res.status(400).json({success:false, message: "Invalid email format"});
        }

        if(password.length < 8){
            return res.status(400).json({success:false, message: "Password must be strong"});
        }

        //Hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        //Creating new user
        const newUser = new userModel({name, email, password: hashedPassword});
        const user = await newUser.save();
        const token = createToken(user._id);
        
        res.json({success:true, token});
        
        

    }
    catch(error){
        console.log(error);
        res.status(500).json({success:false,message: "Server Error"});
    }

}

//Route for Admin Login

const adminLogin = async (req,res)=>{
    try{
        const {email,password} = req.body;
        
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password,process.env.JWT_SECRET); 
            res.json({success:true,token});

        }
        else{
            return res.status(401).json({success:false, message: "Invalid credentials"});
        }
        


    }
    catch(error){
        res.status(500).json({success:false, message: "Server Error"});
    }

}


export {loginUser, registerUser, adminLogin};
