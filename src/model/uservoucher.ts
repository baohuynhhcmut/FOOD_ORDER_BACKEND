import mongoose from "mongoose";

const userVoucherShema = new mongoose.Schema({
    userId:String,
    voucherId:String,
    status:String,
},{timestamps:true})

const userVoucher = mongoose.model('UserVoucher',userVoucherShema)

export default userVoucher;