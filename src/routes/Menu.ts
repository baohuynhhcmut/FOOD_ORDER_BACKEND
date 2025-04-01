import express from 'express'
import MenuController from '../controller/MenuController'
const menuRouter = express.Router()
import { upload } from '../middleware/upload'
import { verifyAccessToken } from '../middleware/auth.middleware'

menuRouter.get('/',MenuController.getMenu)

menuRouter.get('/detail/:id',MenuController.getMenuById)

menuRouter.post('/detail/list',MenuController.getMenuByListId)

menuRouter.get('/restaurant/:restaurantId',MenuController.getRestaurantMenu)

menuRouter.post('/restaurant/:menuId',verifyAccessToken,upload.single("image"),MenuController.editRestaurantMenu)

menuRouter.delete('/restaurant/:menuId',MenuController.deleteMenu)

menuRouter.delete('/restaurant-multi',MenuController.deleteMultiMenu)

menuRouter.get('/voucher/:restaurantId',MenuController.getMenuRestaurantById)


export default menuRouter

