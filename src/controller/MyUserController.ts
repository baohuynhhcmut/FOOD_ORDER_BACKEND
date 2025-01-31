import { Request,Response } from "express";
import User from "../model/user";

const createCurrentUser = async (req:Request,res:Response) =>{
    try {
        const {auth0ID} = req.body;
        console.log(req.body)
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
        user.country = country
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


export default {
    createCurrentUser,
    updateUser,
    getCurrentUser
}