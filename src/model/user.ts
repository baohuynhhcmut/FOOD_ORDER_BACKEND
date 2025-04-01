import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    auth0ID:{
        type:String,
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
    },
    name:{
        type:String
    },
    addressLine1:{
        type:String
    },
    city:{
        type:String
    },
    phoneNumber:{
        type:String
    },
    provider:{
        type:String
    }
})

const User = mongoose.model('User',userSchema)
export default User;