import mongoose, { InferSchemaType } from "mongoose";

const orderMenuSchema = new mongoose.Schema({
    menu:[{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Menu'
        },
        quantity:{
            type:Number,
            required:true
        },
        status:{
            type:String,
            required:true
        }
    }],
    status:{
        type:String,
        enum:["Khởi tạo","Thất bại","Đã thanh toán","Đang giao","Thành công"],
        required:true,
        default:'Khởi tạo'
    },
    total:{
        type:Number,
        required:true
    },
    bankCode:{
        type:String,
        enum:["VNBANK","INTCARD"],
        required:true 
    },
    email:{
        type:String,
        required:true
    }
},{timestamps:true});

const orderMenu = mongoose.model('OrderMenu', orderMenuSchema);

export type orderMenuType = InferSchemaType<typeof orderMenuSchema>;

export default orderMenu;


