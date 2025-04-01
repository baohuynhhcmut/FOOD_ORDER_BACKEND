import mongoose from "mongoose";


const VoucherSchema = new mongoose.Schema({
    restaurantId:{
        type: String
    },
    code:{
        type:String
    },
    code_name:{
        type:String
    },
    type:{
        type:String
    },
    discount:{
        type:Number
    },
    name:{
        type:String
    },
    description:{
        type:String
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
    expiredAt:{
        type:Date,
        default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
})

const Voucher = mongoose.model('Voucher',VoucherSchema)

export default Voucher