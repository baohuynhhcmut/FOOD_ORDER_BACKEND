import express from 'express'
const VoucherRoute = express.Router()
import VoucherController from '../controller/VoucherController'

VoucherRoute.post('/',VoucherController.createVoucher)

VoucherRoute.get('/:restaurantId',VoucherController.getAllVoucher)

VoucherRoute.post('/add-user',VoucherController.addUserToVoucher)

VoucherRoute.get('/get-user/:userId',VoucherController.getUserVoucher)

export default VoucherRoute
