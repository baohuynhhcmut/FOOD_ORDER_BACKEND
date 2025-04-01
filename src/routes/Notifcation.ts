import express from 'express'
import NotifcationController from '../controller/NotifcationController'



const notificationRoute = express.Router()

notificationRoute.post('/',NotifcationController.createNotification)

notificationRoute.get('/',NotifcationController.getAllNotification)

export default notificationRoute