import mongoose from "mongoose";

const NotificationSchema  = new mongoose.Schema({
    email:{
        type:String
    },
    content: [{
        seen:{
            type: Boolean,
            default:false
        },
        title:{
            type:String
        },
        body:{
            type:String
        },
        createdAt: {
            type: Date,
            default: Date.now, 
        }
    }]
},{timestamps:true}) 

const Notifcation = mongoose.model('Notification',NotificationSchema)

export default Notifcation

