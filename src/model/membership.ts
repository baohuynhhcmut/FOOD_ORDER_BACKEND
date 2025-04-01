import mongoose from "mongoose";

const MemberShipSchema = new mongoose.Schema({
    restaurantId : {
        type:  mongoose.Schema.ObjectId
    },
    user: {
        type:  mongoose.Schema.ObjectId
    },
    rank:{
        type: String,
        enum: ['NORMAL','VIP'],
        default: 'NORMAL'
    }
},{timestamps:true})

const MemberShip = mongoose.model('Membership',MemberShipSchema)

export default MemberShip