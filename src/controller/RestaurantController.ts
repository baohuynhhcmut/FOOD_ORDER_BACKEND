import { Request,Response } from "express";
import Restaurant from "../model/restaurant";
import axios, { AxiosResponse } from 'axios';
import removeAccents from 'remove-accents';


const searchRestaurant = async (req:Request,res:Response) => {
    try {
        const city = req.params.city
        
        const searchQuery = (req.query.searchQuery as string) || ''
        const selectedCuisines = (req.query.selectedCuisines as string) || ''
        const sortOption = (req.query.sortOption as string) || 'lastUpdate'
        const page = parseInt(req.query.page as string) || 1
        const pageSize = 3;
        const skip = (page-1)*pageSize
        
        const query : any = {}

        query['city'] = new RegExp(city,'i')
        const cityCheck = await Restaurant.countDocuments(query)

        if (cityCheck === 0) {
          res.status(400).json({
            data: [],
            pagination: {
              total: 0,
              page: 1,
              pages: 1,
            },
          });
          return;
        }

        if(selectedCuisines){
            const cuisineArray = selectedCuisines
                                    .split(',')
                                    .map((cuisineItem) => new RegExp(cuisineItem,'i'))                        
            query['cuisines'] = {$all: cuisineArray}
        }

        if(searchQuery){
            const searchRegex = new RegExp(searchQuery,'i')
            query['$or'] = [
                {restaurantName: searchRegex},
                {cuisines: {$in: [searchRegex]}}
            ]
        }  

        const restaurants = await Restaurant
                                    .find(query)
                                    .sort({[sortOption]:1})
                                    .skip(skip)
                                    .limit(pageSize)
                                    .lean()
                                 

        const total = await Restaurant.countDocuments(query)

        const respone = {
            data: restaurants,
            pagination: { 
                total,
                page,
                pages: Math.ceil(total/pageSize),
            }
        }

        res.status(200).json(respone)

    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Fail to search'})
    }
}

const getRestaurantDetail = async (req:Request,res:Response) => {
    try {
        const id = req.params.id

        const restaurant = await Restaurant.findById(id)
        if(!restaurant){
            res.status(404).json({
                message:'No restaurant available'
            })
        }
        res.status(200).json(restaurant)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Fail to get restaurant detail'
        })
    }
}




const getAllRestaurant = async (req:Request,res:Response) => {

    try {
        let search = req.query.search || ''
        let page = parseInt(req.query.page as string)
        let limit = parseInt(req.query.limit as string)
        let sort:any = {}

        const cityFetch: AxiosResponse = await axios.get('https://provinces.open-api.vn/api/?depth=2');
        const cityData = cityFetch.data.map((item:any) => item.name)

        let city = cityData

        if(req.query.city){
            let temp = req.query.city as string 
            city = [temp]
        }

        if(req.query.sort){
            let temp:any = req.query.sort as string 
            temp = temp.split(',')
            sort[temp[0]] = parseInt(temp[1])
        }
        
        const restaurant = await Restaurant.find({city:{$in:city}})
        .populate('menuItem')
        .sort(sort)
        
        const textFind = removeAccents(search as string)
        let  restaurantRespone = restaurant.filter((item) => {
            const temp = removeAccents(item.restaurantName as string)  
            if(temp.toLowerCase().includes(textFind.toLowerCase())){
                return item
            }
        })

        let  startIndex = (page-1) * limit;
        let endIndex = startIndex + limit;
        let totalRes= restaurantRespone.length

        if(restaurantRespone.length > limit) {
            restaurantRespone = restaurantRespone.slice(startIndex, endIndex)
        }


        res.status(200).json({
            code:200,
            data:restaurantRespone,
            pagination:{
                limit:limit,
                page:page,
                total:totalRes
            },
            messagse:'Success'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:'Sever error'
        })  
    }
}


export default  {
    searchRestaurant,
    getRestaurantDetail,
    getAllRestaurant
}