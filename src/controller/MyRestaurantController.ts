import { Request,Response } from "express";
import Restaurant from "../model/restaurant";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";

const createRestaurant = async (req:Request,res:Response) => {
    try {
        const existRestaurant = await Restaurant.findOne({
            user:req.userID
        })
        
        if(existRestaurant){
            res.status(409).json({
                message:'Restaurant already exist'
            })
            return;
        }
        const image = req.file as Express.Multer.File 
        
        const base64Image = Buffer.from(image.buffer).toString("base64")

        const dataURI = `data:${image.mimetype};base64,${base64Image}`;

        const uploadRespone = await cloudinary.uploader.upload(dataURI);

        const newRestaurant = new Restaurant(req.body)
        newRestaurant.imageUrl = uploadRespone.url
        newRestaurant.lastUpdate = new Date()
        newRestaurant.user = new mongoose.Types.ObjectId(req.userID)
        await newRestaurant.save()

        res.status(200).json(newRestaurant.toObject())
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Something went wrong'
        })
    }

}



const getRestaurant = async (req:Request,res:Response) => {
    try {
        const restaurant = await Restaurant.findOne(
            {user: req.userID}
        )
        if(!restaurant){
            res.status(404).json({
                message:'Restaurant not exist'
            })
            return;
        }
        res.status(200).json(restaurant)
    } catch (error) {
        console.log(error) 
        res.status(500).json({
            message: 'Faild to get restaurant'
        })
    }
}

const updateMyRestaurant = async (req:Request,res:Response) => {
    try {
        const myRestaurant = await Restaurant.findOne(
            {user:req.userID}
        )

        if(!myRestaurant){
            res.status(404).json({
                message:'User not found'
            })
            return ;
        }

        myRestaurant.restaurantName = req.body.restaurantName
        myRestaurant.city = req.body.city
        myRestaurant.country = req.body.country
        myRestaurant.cuisines = req.body.cuisine
        myRestaurant.deliveryPrice = req.body.deliveryPrice
        myRestaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime
        myRestaurant.menuItem = req.body.menuItem
        myRestaurant.lastUpdate = new Date()
        if(req.file){
            const image = req.file as Express.Multer.File 
        
            const base64Image = Buffer.from(image.buffer).toString("base64")

            const dataURI = `data:${image.mimetype};base64,${base64Image}`;

            const uploadRespone = await cloudinary.uploader.upload(dataURI);

            myRestaurant.imageUrl = uploadRespone.url
        }

        await myRestaurant.save()

        res.status(200).json(myRestaurant)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Fail to update restaurant'
        })
    }
}

export default {
    createRestaurant,
    getRestaurant,
    updateMyRestaurant
}