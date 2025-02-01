import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    }
})

const restaurantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    restaurantName: {
        type:String,
        require:true
    },
    city:{
        type:String,
        require:true
    },
    country:{
        type:String,
        require:true
    },
    deliveryPrice:{
        type:Number,
        require:true
    },
    estimateDeliveryTime:{
        type:Number,
        require:true
    },
    cuisine:[{
        type:String,
        require:true
    }],
    menuItem:[menuItemSchema],
    imageUrl:{
        type:String,
        require:true
    },
    lastUpdate:{
        type:Date,
        require:true
    }
})

const Restaurant = mongoose.model('Restaurant',restaurantSchema)

export default Restaurant;

