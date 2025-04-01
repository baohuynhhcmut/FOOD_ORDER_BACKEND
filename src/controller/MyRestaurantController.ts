import { Request,Response } from "express";
import Restaurant from "../model/restaurant";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";
import Order from "../model/order";
import { query } from "../type/user.type";
import Menu from "../model/menu";

const createRestaurant = async (req:Request,res:Response) => {
    try {
        const imageRestaurantReq = req.restaurantImage
        const imageMenuItemReq = req.menuItemImage

        let imageRestaurant = ''
        const menuItemImages:string[] = []

        if(imageRestaurantReq){
            const base64 = Buffer.from(imageRestaurantReq.buffer).toString('base64');
            const dataURI = `data:${imageRestaurantReq.mimetype};base64,${base64}`;
            const uploadRes = await cloudinary.uploader.upload(dataURI);
            imageRestaurant = uploadRes.secure_url;
        }

        if(imageMenuItemReq){
            for (const file of imageMenuItemReq) {
                const base64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = `data:${file.mimetype};base64,${base64}`;
                const result = await cloudinary.uploader.upload(dataURI);
                menuItemImages.push(result.secure_url);
              }
        }

        // console.log(req.body)
        
        const { menuItem } = req.body
        const menuItemSave = await Promise.all(menuItem.map(async (value: any, index: number) => {
            const item = {
                name: value.name,
                price: value.price,
                category: value.category,
                imageMenu: menuItemImages[index]
            };
            const newMenuItem = new Menu(item);
            await newMenuItem.save();
            return newMenuItem._id;
        }));

        const {email} = req.user
        const restaurant = {
            email:email,
            restaurantName: req.body.restaurantName,
            city: req.body.city,
            deliveryPrice: req.body.deliveryPrice,
            estimatedDeliveryTime: req.body.estimatedDeliveryTime,
            cuisines:  req.body.cuisines,
            menuItem: menuItemSave,
            imageUrl:imageRestaurant
        }

        const newRestaurant = new Restaurant(restaurant)
        await newRestaurant.save()

        await Menu.updateMany(
            {_id:{$in:menuItemSave}},
            {restaurant:newRestaurant._id}
        )

        const dataRespone = await Restaurant.find({
            email:email,
        }).populate("menuItem")

        res.status(201).json({
            code:201,
            data:dataRespone,
            message:"Tạo nhà hàng mới thành công"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Something went wrong'
        })
    }
}



const getRestaurant = async (req:Request,res:Response) => {
    try {
        const restaurant = await Restaurant.find(
            {email:req.user.email}
        ).populate("menuItem")


        if(!restaurant){
            res.status(200).json({
                code:200,
                data:[],
                meessage:"Thành công"
            })
            return;
        }

        res.status(200).json({
            code:200,
            data:restaurant,
            meessage:"Thành công"
        })

    } catch (error) {
        console.log(error) 
        res.status(500).json({
            message: 'Faild to get restaurant'
        })
    }
}


const updateMyRestaurant = async (req:Request,res:Response) => {
    try {
        const {email} = req.user
        const {id} = req.params
    
        // console.log(1)
        
        const myRestaurant = await Restaurant.findOne({
            email:email,
            _id:id
        })

        if(!myRestaurant){
            res.status(404).json({
                message:'User not found'
            })
            return ;
        }

        myRestaurant.restaurantName = req.body.restaurantName
        myRestaurant.city = req.body.city
        myRestaurant.cuisines = req.body.cuisines
        myRestaurant.deliveryPrice = req.body.deliveryPrice
        myRestaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime
        if(req.file){
            const image = req.file as Express.Multer.File 
        
            const base64Image = Buffer.from(image.buffer).toString("base64")

            const dataURI = `data:${image.mimetype};base64,${base64Image}`;

            const uploadRespone = await cloudinary.uploader.upload(dataURI);

            myRestaurant.imageUrl = uploadRespone.url
        }

        await myRestaurant.save()

        res.status(200).json(myRestaurant)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Fail to update restaurant'
        })
    }
}







const getMyRestaurantOrder = async (req:Request,res:Response) => {
    try {
        const restaurant = await Restaurant.findOne({
            user: req.userID
        })

        if(!restaurant){
            res.status(400).json({
                message:'Dont have restaurant'
            })
            return
        }

        const orders = await Order.find({
            restaurant: restaurant._id
        }).populate('restaurant').populate('user')
        
        res.json(orders)
    
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Fail to get my restaurant order'
        })
    }
}

const removeRestaurant = async(req:Request,res:Response) => {
    try {
        const {email} = req.user
        const {id} = req.body
        // id:67e04df76717f94f2dc68c1d
        const result = await Restaurant.deleteOne({
            email:email,
            _id:id
        })

        if(result.deletedCount == 1){
            const restaurantList = await Restaurant.find({email:email})
            res.status(200).json({
                code:200,
                data:restaurantList,
                message:"Xóa thành công"
            })
            return;
        }
        
        res.status(404).json({ code: 404, message: 'Không tìm thấy Restaurant phù hợp.' });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Sever error'
        })
    }
}

const removeMultiRestaurant = async(req:Request,res:Response) => {
    try {
        const {email} = req.user 
        const { data } = req.body 
        const listID = data.split(",")
        
        const result = await Restaurant.deleteMany({
            _id: {$in:listID},
            email:email
        })

        if(result.deletedCount > 0){
            const data = await Restaurant.find({email:email})
            res.status(200).json({
                code:200,
                data:data,
                message:"Xóa thành công"
            })
            return 
        }
        res.status(400).json({
            code:400,
            data:[],
            message:"Xóa không thành công"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Sever error'
        })
    }
}


const searchRestaurant = async(req:Request,res:Response) => {
    try {
        const {email} = req.user
        const {searchText} = req.body

        const query:query = {
            email:email,   
            date:{
                from: searchText?.date?.from ? new Date(searchText.date.from) : new Date('1800-01-01'),
                to: searchText?.date?.to ? new Date(searchText.date.to) : new Date('2500-01-01')
            }
        }

        if(searchText.restaurantName){
            query.restaurantName = searchText.restaurantName
        }else{
            query.restaurantName = ""
        }
        
        if(searchText.city){
            query.city = searchText.city
        }
        else{
            query.city = ""
        }

        console.log(query)

        const result = await Restaurant.find({
            email:email,
            restaurantName: {$regex: query.restaurantName,$options:'i'},
            city: {$regex: query.city,$options:'i'},
            createdAt:{
                $gte: query.date.from,
                $lte: query.date.to
            }
        })

        res.status(200).json({
            code:200,
            data:result,
            message:"Tìm kiếm thành công"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Sever error'
        })
    }
}

const restaurantFindById = async(req:Request,res:Response) => {
    try {
        const {email} = req.user
        const {id} = req.params
        const restaurant = await Restaurant.findOne({
            email:email,
            _id:id
        })
        res.status(200).json({
            code:200,
            data:restaurant,
            message:"Tìm kiếm thành công"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Sever error'
        })
    }
}





export default {
    createRestaurant,
    getRestaurant,
    updateMyRestaurant,
    getMyRestaurantOrder,
    removeRestaurant,
    removeMultiRestaurant,
    searchRestaurant,
    restaurantFindById
}