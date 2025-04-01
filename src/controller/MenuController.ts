import { Request,Response } from "express";
import removeAccents from 'remove-accents';
import Menu from "../model/menu";
import uploadToCloudinary from "../util/cloudinary";
import orderMenu from "../model/ordermenu";

// const options = ["Phù hợp nhất","A-Z","Mới nhất","Đánh giá trung bình"]
const checkBoxValue = ["Buger","Cơm gà","Mỳ ý","Bánh xèo","Gà rán","Hủ tiếu","Cơm sườn","Khác"]

const getMenu = async (req:Request,res:Response) => {
    try {

        let search = req.query.search || ''
        let page = parseInt(req.query.page as string)
        let limit = parseInt(req.query.limit as string)
        let sort:any = {}

        let category = checkBoxValue
        
        if(req.query.category){
            let temp = req.query.category as string
            category = temp.split(',')
        }
        
        if(req.query.sort){
            let temp:any = req.query.sort as string
            temp = temp.split(',')
            sort[temp[0]] = parseInt(temp[1])
        }

        // console.log(sort)

        const menu = await Menu.find({
            category:{$in:category}
        })
        .sort(sort)



        const textFind = removeAccents(search as string)

        let  menuRespone = menu.filter((item) => {
            const temp = removeAccents(item.name as string)  
            if(temp.toLowerCase().includes(textFind.toLowerCase())){
                return item
            }
        })

        let  startIndex = (page-1) * limit;
        let endIndex = startIndex + limit;
        let totalMenu= menuRespone.length

        if(menuRespone.length > limit) {
            menuRespone = menuRespone.slice(startIndex, endIndex)
        }

        res.status(200).json({
            code:200,
            data:menuRespone,
            pagination:{
                page:page,
                limit:limit,
                total:totalMenu
            },
            messagee:'Thành công'
        })
            

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Server error'
        })
    }
}





export const getMenuById = async (req:Request,res:Response) => {
    try {
        const menu = await Menu.findById(req.params.id)
        res.status(200).json({
            code:200,
            data:menu,
            message:'Thành công'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Server error'
        })
    }
}


export const getMenuByListId = async (req:Request,res:Response) => {
    try {
        const {idList} = req.body
        console.log(idList)
        // const idParseList = JSON.parse(idList)

        // const idParse = idList.split(',')

        const menu = await Menu.find({_id:{$in:idList}})

        res.status(200).json({
            code:200,
            data:menu,
            message:'Thành công'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Server error'
        })
    }
}

const allGenr = ["Buger","Cơm gà","Mỳ ý","Bánh xèo","Gà rán","Hủ tiếu","Cơm sườn","Khác"]

const statusMenu =  ['Đang bán','Ngừng bán','Sắp ra mắt']

const getRestaurantMenu = async (req:Request,res:Response) => {
    try {
        const {restaurantId} = req.params
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string)  || 5
        const search = req.query.search || ''
        let sort = req.query.sort as string 
        let genre = allGenr
        let status = statusMenu

        
        if(req.query.genre){
            const gernerList = req.query.genre as string
            genre = gernerList.split(',') 
        }
    

        let sortObj:any = {}
        if(req.query.sort){
            let temp = sort.split(',')
            sortObj[temp[0]] = parseInt(temp[1])
        }
        

        if(req.query.status){
            const temp = req.query.status as string
            status =   temp.split(',')
        }

        const menuOfRestaurant = await Menu
        .find({
            restaurant:restaurantId,
            status:{$in:status},
            category:{$in:[...genre]}
        })
        .sort(sortObj)
        

        const textFind = removeAccents(search as string)

        let  menuRespone = menuOfRestaurant.filter((item) => {
            const temp = removeAccents(item.name as string)  
            if(temp.toLowerCase().includes(textFind.toLowerCase())){
                return item
            }
        })

        let  startIndex = (page-1) * limit;
        let endIndex = startIndex + limit;
        let totalMenu= menuRespone.length

        // if(menuRespone.length <= limit){
        //     menuRespone = []
        // }
        // else{
        //     menuRespone = menuRespone.slice(startIndex, endIndex)
        // }
        if(menuRespone.length > limit) {
            menuRespone = menuRespone.slice(startIndex, endIndex)
        }

        res.json({
            code:200,
            data:{
                menu: menuRespone,
                pagination: {
                    page: page,
                    limit:limit,
                    total: totalMenu
                }
            },
            message:'Success'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Server error'
        })
    }
}



const editRestaurantMenu = async (req:Request,res:Response) => {
    try {
        const {menuId} = req.params
        
        if(!menuId){
            res.status(404).json({
                message:'Menu id not exist'
            })
            return;
        }
        if (!req.file && !req.body) {
            res.status(400).json({ message: "No data updated" });
            return
        }

        if(req.file){
            const result  = await uploadToCloudinary(req.file)
            req.body['imageMenu'] = result.url
        }

        await Menu.updateOne(
            {_id:menuId},
            req.body
        )
    
        const menuResppone = await Menu.findOne({_id:menuId})
        
        res.status(200).json({
            code:200,
            data:menuResppone,
            message:'Thành công'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Server error'
        })
    }
}

const deleteMenu = async (req:Request,res:Response) => {
    try {
        const {menuId} = req.params
        if(!menuId){
            res.status(404).json({
                message:'Menu id not exist'
            })
            return;
        }
        await Menu.deleteOne({_id:menuId})
        res.status(200).json({
            code:200,
            data:[],
            message:'Success'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Server error'
        })
    }
}

const deleteMultiMenu = async (req:Request,res:Response) => {
    try {
        const {menuList} = req.body 
        // console.log(menuList)

        if(!menuList || menuList.length == 0){
            res.status(404).json({
                message:'Menu deleted error'
            })
            return;
        }
        await Menu.deleteMany({_id:{$in:menuList}})
        res.status(200).json({
            code:200,
            data:[],
            message:'Success'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Server error'
        })
    }
}

const  getMenuRestaurantById = async (req:Request,res:Response) => {
    try {
        const  {restaurantId} = req.params
        const menu = await Menu.find({restaurant:restaurantId})
        res.status(200).json({
            code:200,
            data:menu,
            message:'Success'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Server error'
        })
    }
}

export default {
    getMenu,
    getMenuById,
    getMenuByListId,
    getRestaurantMenu,
    editRestaurantMenu,
    deleteMenu,
    deleteMultiMenu,
    getMenuRestaurantById
}

