import { Request,Response } from "express";
import MemberShip from "../model/membership";


const registerMembership = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        console.log(error)
        res.status(500).json({messgae:'Server error'})
    }
}

const getMembership = async (req:Request,res:Response) => {
    try {
        
    } catch (error) {
        console.log(error)
        res.status(500).json({messgae:'Server error'})
    }
 }

export default {

}