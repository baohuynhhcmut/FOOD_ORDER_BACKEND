import express from 'express'
import RestaurantController from "../controller/RestaurantController"
const router = express.Router()

router.get('/search/:city' ,RestaurantController.searchRestaurant)

export default router;