import express,{Request,Response} from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import userRoute from './routes/UserRoute'

mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING as string)
    .then(() => {
        console.log('Connect to DB success')
    })
    .catch(error => console.log(error))


const app = express()

app.use(express.json())
app.use(cors())


app.get('/test',(req:Request, res: Response)=>{
    res.json({message: 'Hello World'})
})

app.use("/api/my/user",userRoute)

app.listen(7000,() => {
    console.log(`App listen on port ${7000}`)
}) 