import express from 'express'
import { jwtCheck, jwtParse } from '../middleware/auth';
import OrderController from "../controller/OrderController"
import { verifyAccessToken } from '../middleware/auth.middleware';

const orderRouter = express.Router()

orderRouter.post('/checkout/create-checkout-session',jwtCheck,jwtParse,OrderController.createCheckoutSession)

orderRouter.post('/checkout/webhook',OrderController.stripeHandlerWebHook)

orderRouter.post('/vn-pay',verifyAccessToken,OrderController.orderVNPAY)

orderRouter.get('/vnpay_ipn',OrderController.ipn_VNPAY)

orderRouter.get('/',verifyAccessToken,OrderController.getOrders)

orderRouter.delete('/',OrderController.deleteAllOrder)

orderRouter.get('/restaurant/:restaurantId',OrderController.getOrderOfRestaurant)

orderRouter.post('/restaurant/edit',OrderController.editStatusMenu)

export default orderRouter;

