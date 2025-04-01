import userVoucher from "../model/uservoucher";
import Voucher from "../model/voucher";
import { Request,Response } from "express";


const getAllVoucher = async (req:Request,res:Response) => {
    try {
        const {restaurantId} = req.params
        // console.log(restaurantId)
        const vouchers = await Voucher.find({restaurantId:restaurantId})
        res.status(200).json({
            code:200,
            data:vouchers,
            message:'Success'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Server error'})
    }
}

const updateVoucher = async(req:Request,res:Response) => {
    try {
        const {dataUpdated} = req.body
        const {restaurantId} = req.params
        await Voucher.updateOne({restaurantId:restaurantId},{dataUpdated})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Server error'})
    }
}

const createVoucher = async(req:Request,res:Response) => {
    try {
        const {dataUpdated} = req.body
        const newVoucher = new Voucher(dataUpdated)
        const exitVoucher = await Voucher.find({restaurantId:dataUpdated.restaurantId})
        newVoucher.code_name = `KM_${exitVoucher.length < 10 ? `0${exitVoucher.length+1}` :  exitVoucher.length+1}`
        await newVoucher.save()
        res.status(200).json({
            code:200,
            data:newVoucher,
            message:'Success'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Server error'})
    }
}

const addUserToVoucher = async (req:Request,res:Response) => {
    try {
        const {data} = req.body;
        console.log(data)
        const voucherCheck = await Voucher.findOne({_id: data.voucherId})
        if(voucherCheck){
            if(data.type == 'FREE'){
                const body = {
                    userId:data.userId,
                    voucherId:data.voucherId,
                    status:'NOT USE'
                }
                const result = new userVoucher(body)
                await result.save()
                // console.log(result)
                res.status(200).json({
                    code:200,
                    data:result,
                    message:'Success'
                })
                return;
            }
            else{
                const check  = voucherCheck.code == data.code
                if(check){
                    const body = {
                        userId:data.userId,
                        voucherId:data.voucherId,
                        status:'NOT USE'
                    }
                    const result = new userVoucher(body)
                    await result.save()
                    res.status(200).json({
                        code:200,
                        data:result,
                        message:'Success'
                    })
                    return;
                }
                else{
                    res.status(400).json({message:'Code voucher not correct'})
                }
            }
        }
        else{
            res.status(404).json({message:'Voucher not found'})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Server error'})
    }
}

const addMenuToDiscountToVoucher = async (req:Request,res:Response) => { 
    try {
        const {menuList} = req.body
        const {restaurantId} = req.params
        if(menuList.length <= 0){
            res.status(404).json({message:'Not exist menu'})
            return;
        }
        const updatedData = await Voucher.findOneAndUpdate(
            {restaurantId:restaurantId},
            {$addToSet:{email: {$each:menuList}}},
            { new: true }
        )
        res.status(200).json({
            code:200,
            data: updatedData,
            message:'Success'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Server error'})
    }
}

const removeVoucher = async (req:Request,res:Response) => {
    try {
        const {restaurantId} = req.params
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Server error'})
    }
}

const getUserVoucher = async (req:Request,res:Response) => { 
    try {
        const {userId} = req.params
        const userVouchers = await userVoucher.aggregate([
            {
              $match: { userId: userId }, // Match by userId
            },
            {
              $addFields: {
                voucherIdObj: { $toObjectId: "$voucherId" }, // Convert voucherId (string) to ObjectId
              },
            },
            {
              $lookup: {
                from: "vouchers",
                localField: "voucherIdObj",
                foreignField: "_id",
                as: "voucherDetail",
              },
            },
            { $unwind: "$voucherDetail" }, 
            {
                $project: {
                  voucherIdObj: 0, // Remove voucherIdObj from the final output
                },
            },
        ]);

        console.log(userVouchers)
        res.status(200).json({
            code:200,
            data: userVouchers,
            message:'Success'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Server error'})
    }
}



export default {
    getAllVoucher,
    updateVoucher,
    createVoucher,
    addUserToVoucher,
    removeVoucher,
    addMenuToDiscountToVoucher,
    getUserVoucher
}

