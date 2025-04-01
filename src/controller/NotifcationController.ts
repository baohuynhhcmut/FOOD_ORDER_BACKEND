import { Request,Response } from "express";
import Notifcation from "../model/notification";


const createNotification = async  (req:Request,res:Response) => {
    const { notification } = req.body 
    // console.log("1",notification)
    const exist = await Notifcation.findOne({email:notification.email})
    if(exist){
        res.status(200).json({
            code:200,
            data:exist,
            message:'Already register notifcationn'
        })
        return ;
    }
    const data  = {
        email:notification.email as string ,
    }

    const newNotfication = new Notifcation(data)
    await newNotfication.save()
    res.status(200).json({
        code:200,
        data:newNotfication,
        message:'Success'
    })
}

const getAllNotification = async (req:Request,res:Response) => {
    try {
        // console.log(1)
        const {email} = req.query
        if(!email){
            res.status(404).json({
                messaage:'Not found'
            })
        }
        const notifications = await Notifcation.findOne({email:email}).sort({createdAt:-1}).limit(5)
        res.status(200).json({
            code:200,
            data:notifications,
            message:'Success'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Server error'
        })
    }
}


export default {
    createNotification,
    getAllNotification
}