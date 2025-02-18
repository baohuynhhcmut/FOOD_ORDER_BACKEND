import { Request,Response } from "express";
import Restaurant from "../model/restaurant";

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


function removeVietnameseTones(str:string) {
    return str
        .normalize("NFD") // Tách dấu khỏi chữ cái
        .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
        .replace(/đ/g, "d") // Chuyển đổi "đ" thành "d"
        .replace(/Đ/g, "D"); // Chuyển đổi "Đ" thành "D"
}

export default  {
    searchRestaurant
}