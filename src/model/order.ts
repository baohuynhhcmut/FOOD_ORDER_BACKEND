import mongoose from "mongoose";


const OderSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deliveryDetail: {
        name: String,
        addressLine1: String,
        city: String,
        country: String,
        email: String
    },
    cartItem:[
        {
            _id: String,
            name:  String,
            quantity: Number
        }
    ],
    totalAmout: Number,
    status:{
        type:String,
        enum:['placed','paid','inProcess','outForDelivery','delivered']
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

const Order = mongoose.model('Order',OderSchema)

export default Order