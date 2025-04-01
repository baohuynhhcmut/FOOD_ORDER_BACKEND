import mongoose,{InferSchemaType, mongo} from "mongoose";

const menuItemSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId, 
        require:true,
        default: () => new mongoose.Types.ObjectId()
    },
    name:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    }
})

export type MenuSchema = InferSchemaType<typeof menuItemSchema>;
 
const restaurantSchema = new mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    restaurantName: {
        type:String,
        require:true
    },
    city:{
        type:String,
        require:true
    },
    deliveryPrice:{
        type:Number,
        require:true
    },
    estimatedDeliveryTime:{
        type:Number,
        require:true
    },
    cuisines:[{
        type:String,
        require:true
    }],
    imageUrl:{
        type:String,
        require:true
    },
    menuItem:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu'
        }
    ]
},{
    timestamps:true
})

const Restaurant = mongoose.model('Restaurant',restaurantSchema)

export default Restaurant;

