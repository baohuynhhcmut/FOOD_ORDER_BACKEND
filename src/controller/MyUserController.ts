import { Request,Response } from "express";
import User from "../model/user";
import bcript from "bcrypt"
import { generateAccessToken, generateRefreshToken, userPayload } from "../util/auth";
import nodemailer from "nodemailer"

const saltRounds = 10

const createCurrentUser = async (req:Request,res:Response) =>{
    try {
        const {auth0ID} = req.body;
       
        const existUser = await User.findOne({
            auth0ID: auth0ID
        })
        if(existUser){
            res.status(200).send({
                message: 'User already exist'
            })
            return;
        }
        const newUser = new User(req.body)
        await newUser.save();
        res.status(200).json(newUser.toObject())

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Error creating user'
        })
    }
}

const updateUser = async (req:Request,res:Response) =>{
    try {
        console.log(req.body)
        const {name,addressLine1,city,country} = req.body
        const user = await User.findById(req.userID)
        if(!user){
            res.status(404).json({
                message: 'User not found'
            })
            return;
        }
        user.name = name
        user.addressLine1 = addressLine1
        user.city = city
        await user.save()
        res.status(201).json(user)
    } catch (error) {
        console.log(error)
        res.status(501).json({
            message: 'Error create user'
        })
    }
}


const getCurrentUser = async (req:Request,res:Response) =>{
    try {
        const user = await User.findOne({_id:req.userID})
        if(!user){
            res.status(401).json(({
                message:'User not found'
            }))
            return;
        }
        res.status(200).json(user)
    } catch (error) {
        
    }
}

const register = async (req:Request,res:Response) => {
    const user = req.body

    const existUser = await User.findOne({email:user.email})

    user.password = await bcript.hash(user.password,saltRounds)

    if(existUser){
        res.status(409).json({
            status:409,
            data:[],
            message: "Email hoặc số điện thoại dùng đã tồn tại"
        })
        return
    }   

    const newUser = new User(user)
    await newUser.save()

    res.status(201).json({
        status:201,
        data:newUser,
        message:"Create user success"
    })
}

const login = async(req:Request,res:Response) => {
    try {
        const { account ,password} = req.body;
        
        const existUser = await User.findOne({
            $or: [
                { email: account },
                { phoneNumber: account}
            ]
        })
        if(!existUser){
            res.status(400).json({
                status:404,
                data:[],
                message:"Người dùng không tồn tại"
            })
            return
        }

        const valid = await bcript.compare(password,existUser.password as string) 
        if(!valid){
            res.status(401).json({
                status: 401,
                data: [],
                message: "Mật khẩu không đúng"
            });
            return
        }

        const userData = existUser.toObject();
        delete userData.password;

        const accessToken = generateAccessToken({ email: userData.email as string, phoneNumber: userData.phoneNumber as string });
        const refreshToken = generateRefreshToken({ email: userData.email as string, phoneNumber: userData.phoneNumber as string });

        res.status(200).json({
            status:200,
            data:{
                user:userData,
                accessToken:accessToken,
                refreshToken:refreshToken
            },
            message:"Đăng nhập thành công"
        })

    } catch (error) {
        console.log(error)
        res.status(505).json({message:"Server error"})
    }
}


const getUserInfo = async (req:Request,res:Response) => {
    try {

        const {email} = req.user
        const user = await User.findOne({email:email}).select("-password")
        res.status(200).json({
            status:200,
            data:user,
            message:"Get user info success"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Server error"})
    }
}

const resetPassword = async (req:Request,res:Response) => {
    try {
        const {email} = req.body
        const existUser = await User.findOne({email:email}).select("-password")
        if(!existUser){
            res.status(400).json({
                status:404,
                data:[],
                message:"Người dùng không tồn tại"
            })
            return
        }
        const plainPassword = Math.random().toString(36).slice(-8)
        const hashedPassword = await bcript.hash(plainPassword,saltRounds)
        existUser.password = hashedPassword
        await existUser.save()

        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.APP_NAME,
                pass:process.env.APP_MAIL
            }
        })

        const mailOptions = {
            from: 'BKU_Chicken@gmail.com',
            to: email,
            subject: 'Mật khẩu mới',
            text: `Xin chào ${existUser.name},\n\nMật khẩu mới của bạn là : ${plainPassword}`,
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({
            code:200,
            data:[],
            message:"Đã gửi mật khẩu mới,vui lòng kiểm tra email"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Server error"})
    }
}

const updateUserInfo = async (req:Request,res:Response) => {
    try {
        const {dataUpdate} = req.body   

        const email = req.user.email    

        const updatedUser = await User.findOneAndUpdate(
            {email:email},
            {$set:dataUpdate},
            {new:true}
        ).select("-password")


        res.status(200).json({
            status: 200,
            data: updatedUser,
            message: "Cập nhật thành công",
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Server error"})   
    }
}

export const loginWithGoogleAuthen = async (req:Request,res:Response) => {
    try {
        const {email,phoneNumber,name} = req.body.data 
    
        const existUser = await User.findOne({email:email})
        const accessToken = generateAccessToken({ email: email as string, phoneNumber: phoneNumber as string });
        const refreshToken = generateRefreshToken({ email: email as string, phoneNumber:phoneNumber as string });
        if(existUser){
            res.status(200).json({
                user:existUser,
                accessToken:accessToken,
                refreshToken:refreshToken
            })
            return 
        }

        const data = {
            name:name as string,
            email:email as string,
            phoneNumber:phoneNumber as string,
            provider:'Google'
        }
        const newUser = new User(data)
        await newUser.save()
        res.status(200).json({
            code:200,
            data:{
                user:newUser,
                accessToken:accessToken,
                refreshToken:refreshToken
            },
            message:'Success'
    })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Server error'
        })
        return 
    }
}


export default {
    createCurrentUser,
    updateUser,
    getCurrentUser,
    login,
    register,
    getUserInfo,
    resetPassword,
    updateUserInfo,
    loginWithGoogleAuthen
}

