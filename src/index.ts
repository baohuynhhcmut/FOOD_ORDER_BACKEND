import express,{Request,Response} from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import userRoute from './routes/UserRoute'
import { v2 as cloudinary } from 'cloudinary';
import myRestaurantRoute from './routes/MyRestaurant'
import resRoute from "./routes/Restaurant"
import orderRouter from './routes/OrderRoute'
import menuRouter from './routes/Menu'
import ngrok from '@ngrok/ngrok'
import  "../src/Firebase/config"
import notificationRoute from './routes/Notifcation'
import VoucherRoute from './routes/Voucher'


mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING as string)
    .then(() => {
        console.log('Connect to DB success')
    })
    .catch(error => console.log(error))


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret:  process.env.CLOUD_SECRET_KEY
});

const app = express()

app.use('/api/order/checkout/webhook',express.raw({ type: "*/*" }))

app.use(express.json({limit:'50mb'}))
app.use(cors({
    origin:"*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH']
}))


// app.get('/test',(req:Request, res: Response)=>{
//     res.json({message: 'Hello World'})
// })

app.use('/api/noti',notificationRoute)

app.use("/api/my/user",userRoute)

app.use("/api/my/restaurant",myRestaurantRoute)

app.use("/api/res",resRoute)

app.use("/api/menu",menuRouter)

app.use('/api/order',orderRouter)

app.use('/api/voucher',VoucherRoute)



app.use('/',function(req:Request,res:Response){
    res.json({message:'Hello World'})
})


app.listen(7000,() => {
    console.log(`App listen on port ${7000}`)
    ngrok.connect({ addr: 7000, authtoken_from_env: true })
	.then(listener => console.log(`Ingress established at: ${listener.url()}`));
})  

