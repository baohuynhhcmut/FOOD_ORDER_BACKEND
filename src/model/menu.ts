import mongoose from "mongoose"

const menuItemSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    imageMenu:{
        type:String,
        require:true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    category:{
        type:String,
        require:true
    },
    status:{
        type:String,
        enum:['Đang bán','Ngừng bán','Sắp ra mắt'],
        default: 'Đang bán',
        validate: {
            validator: function (v:string) {
              return ['Đang bán', 'Ngừng bán', 'Sắp ra mắt'].includes(v);
            },
            message: (props:any) => `${props.value} không phải là trạng thái hợp lệ!`
        }
    }
},{timestamps:true})

menuItemSchema.index({ name: 'text' })

const Menu = mongoose.model('Menu',menuItemSchema)

export default Menu;
