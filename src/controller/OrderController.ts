import { Request, Response } from "express";
import Stripe from "stripe";
import Restaurant, { MenuSchema } from "../model/restaurant";
import Order from "../model/order";
import moment from "moment";
import crypto from 'crypto'
import qs from 'qs'
import Menu from "../model/menu";
import { createOrderVNPAY_URL, WebHookVNPAY } from "../util/vnpay";
import orderMenuModel, { orderMenuType } from "../model/ordermenu";
import { stat } from "fs";
import orderMenu from "../model/ordermenu";
import mongoose, { mongo } from "mongoose";
import Notifcation from "../model/notification";
import User from "../model/user";
import { messageNotification } from "../util/noti";
import { getMessaging } from 'firebase-admin/messaging';

const stripeApp = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;

type CheckoutSessionRequest = {
  cartItems: {
    _id: string;
    name: string;
    quantity: number;
  }[];
  deliveryDetail: {
    name: string;
    addressLine1: string;
    city: string;
    country: string;
    email?: string | undefined;
  };
  restaurantId: string;
};

const createCheckoutSession = async (req: Request, res: Response) : Promise<void> => {
  try {
    const checkoutSession: CheckoutSessionRequest = req.body;
    const restaurant = await Restaurant.findById(checkoutSession.restaurantId);
    if (!restaurant) {
      throw new Error();
    }

    const lineItems = createLineItem(checkoutSession, restaurant.menuItem);

    const newOrder = new Order({
      restaurant: restaurant._id,
      user:req.userID,
      status:'placed',
      deliveryDetail: checkoutSession.deliveryDetail,
      cartItem: checkoutSession.cartItems,
      createAt: new Date()
    })

    const session = await createSession(
        lineItems,
        newOrder._id.toString(),
        restaurant.deliveryPrice as number,
        restaurant._id.toString()
    )

    if(!session.url){
        res.status(500).json({
            message:'Error creating stripe session'
        })
    }

    await newOrder.save()

    res.json({
        url: session.url
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Fail to create order",
    });
  }
};

const createLineItem = (
  checkoutSession: CheckoutSessionRequest,
  menuItems: MenuSchema[]
) => {
  const lineItem = checkoutSession.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() == cartItem._id.toString()
    );

    if (!menuItem) {
      throw new Error();
    }
    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "usd",
        product_data: {
          name: menuItem.name as string,
        },
        unit_amount: menuItem.price as number,
      },
      quantity: cartItem.quantity,
    };

    return line_item;
  });

  return lineItem;
};

const createSession = async (
  lineItem: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
) => {
    const sessionData = await stripeApp.checkout.sessions.create({
        line_items: lineItem,
        shipping_options:[
            {
                shipping_rate_data:{
                    display_name: 'Delivery',
                    type:'fixed_amount',
                    fixed_amount:{
                        amount:deliveryPrice,
                        currency:'usd'
                    }
                }
            }
        ],
        mode: 'payment',
        metadata:{
            orderId,
            restaurantId
        },
        success_url: `${FRONTEND_URL}/order-status?success=true`,
        cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`
    })
    return sessionData
};


const stripeHandlerWebHook = async (req:Request,res:Response) => {

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
    try {
      event = stripeApp.webhooks.constructEvent(req.body, sig as string, endpointSecret as string);
      switch (event.type) {
        case "checkout.session.completed":
            const orderId = event.data.object.metadata?.orderId
            const order = await Order.findById(orderId)
            if(!order){
              res.status(404).json({
                message:'Fail to get order'
              })
              return;
            }

            order.totalAmout = event.data.object.amount_total
            order.status = 'paid'
            await order.save()

            res.status(200).send()
            break;
  
        default:
            console.log(`❓ Unhandled event type: ${event.type}`);
      }
    
    } catch (error) {
      console.log(error)
      res.status(500).json({
        message:'Fail to payment'
      })
    }    
}

const getOrder = async (req:Request,res:Response) => {
    try {
      const orders = await Order.find({user:req.userID}).populate('restaurant').populate('user')
      res.json(orders)

    } catch (error) {
      console.log(error)
      res.status(500).json({
        message:'Fail to get order'
      })
    }
}


type OrderList = {
  item:string,
  quantity:number;
}


const orderVNPAY = async (req:Request,res:Response) => {
  try {
    const {email} = req.user
    const orderList  = req.body.orderList as OrderList[]

    const idOrderList = orderList.map((order)=> order.item)
    
    const orders = await Menu.find({_id:{$in:idOrderList}})

    const totalAmount = orders.reduce((total,order,index)  => {
        return total + (order.price as number)*orderList[index].quantity; 
    }, 0);

    const orderLisUpdateStatus = orderList.map((item) => {
        return {
          ...item,
          status:'Khởi tạo'
        }
    })

    const tempMenu = {
        menu : orderLisUpdateStatus,
        status:'Khởi tạo',
        total:totalAmount,
        bankCode:req.body.bankCode,
        email:email
    }

    const newOrderMenu = new orderMenuModel(tempMenu)
    await newOrderMenu.save()
    const url_respone = createOrderVNPAY_URL(totalAmount,newOrderMenu._id.toString(),req.body.bankCode)
    
    console.log(url_respone)
    res.status(200).json({
      code:200,
      data: url_respone,
      message:'Success'
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      message:'Server error'
    })
  }
}

const ipn_VNPAY = async (req:Request,res:Response) => {
  try {
    
    const {isSuccess,id} = WebHookVNPAY(req)
    const updatedData = isSuccess?'Đã thanh toán':'Thất bại'


    // console.log(req.query)
    // console.log(id)
    // console.log(isSuccess)

    
    if(!id){
      res.status(404).json({
        message:'Order not found'
      })
      return;
    }

    await orderMenu.updateOne(
      { _id: id },
      {
        $set: {
          status: updatedData, 
          'menu.$[].status': updatedData 
        }
      }
    );
    
    const order = await orderMenu.findOne({_id:id}).select('email total _id')
    if(order){
      const NotificationUser = await Notifcation.findOne({email:order.email})
      if(NotificationUser){
        const message = messageNotification(isSuccess,order.total,order._id.toString())
        
        await Notifcation.updateOne(
          {email:order.email},
          {
            $push: {
              content: {
                title: message.notification.title,
                body: message.notification.body,
                seen: false,
              },
            },
          }
        )
      }
    }


    res.status(200).send()

  } catch (error) {
    console.log(error)
    res.status(500).json({
      message:'Server error'
    })
  }
}


export const getOrders = async(req:Request,res:Response) => {
  try {
    let  page = parseInt(req.query.page as string)
    let limit = parseInt(req.query.limit as string)
    let sort:any = req.query.sort as string 
    sort = sort.split(',')
    let sortObj:any = {
      [sort[0]]: parseInt(sort[1])
    }
    let search = req.query.search as string || ''
    
    // console.log(limit) 

    const {email} = req.user 
    const orders = await orderMenu.find({
      email:email,
      ...(search && {_id: new mongoose.Types.ObjectId(search) })
    })
      .populate({
        path:'menu.item',
        populate:{
          path: 'restaurant',
          select:'restaurantName'
        }
      })
      .sort(sortObj)
      // .skip((page-1)*limit)
      // .limit(limit)
    
    const total = await orderMenu.find({email:email}).countDocuments()
    // console.log(page)  

    res.status(200).json({
      code:200,
      data:orders,
      pagination:{
        limit:limit,
        page:page,
        total:total
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

// test
export const deleteAllOrder = async(req:Request,res:Response) => {
    try {
      await orderMenu.deleteMany()
      res.status(200).json({message:'ok'})
    } catch (error) {
      console.log(error)
      res.status(500).json({
        message:'Server error'
      })
    }
}

const orderStatus = ["Khởi tạo","Thất bại","Đã thanh toán","Đang giao","Thành công",'Tất cả']

const bankCodeTemp = ["Thanh toán thẻ ATM  ngân hàng","Thanh toán thẻ quốc tế",'Tất cả']

export const getOrderOfRestaurant = async(req:Request,res:Response) => { 
  try {
    const {restaurantId} = req.params 
    if(!restaurantId){
      res.status(404).json({
        message:'RestaurantId not exist'
      })
      return 
    }

    let status:string|string[] = orderStatus[5]
    let bankCode:string|string[] = bankCodeTemp[2]
    let search:string = ''
    let sort = req.query.sort as string

    let page = parseInt(req.query.page as string) 
    let limit = parseInt(req.query.limit as string)
    

    let sortObj:any = {}
    if(req.query.sort){
        let temp = sort.split(',')
        sortObj[temp[0]] = parseInt(temp[1])
    }
    else{
      sortObj['createdAt'] = -1
    }
        
    if(req.query.status != status){
      status = [req.query.status as string] 
    }
    else{
      status = orderStatus.slice(0,-1)
    }

    if(req.query.search){
      search = req.query.search as string
    }

    if(req.query.bankCode != bankCode){
      bankCode = req.query.bankCode == bankCodeTemp[0] ? ["VNBANK"] : ['INTCARD']
    }
    else{
      bankCode = ["VNBANK","INTCARD"]
    }


    const data = await orderMenu.aggregate([
      {$unwind:"$menu"},
      {
        $lookup: {
          from: "menus",
          localField: "menu.item",
          foreignField: "_id",
          as: "menuDetails"
        }
      },
      { $unwind: "$menuDetails" },
      {
        $match: {
          "menuDetails.restaurant": new mongoose.Types.ObjectId(restaurantId),
          "bankCode": {$in:bankCode},
          "menu.status": {$in:status},
          ...(search && {
            "menu._id": new mongoose.Types.ObjectId(search)
          })
        }
      },
      {
        $addFields: {
          "menu.totalPrice": {
            $multiply: ["$menu.quantity", "$menuDetails.price"]
          },
        }
      },
      {
        $sort: sortObj
      },
      {
        $skip:(page-1)*limit
      },
      {
        $limit:limit
      }
    ])

    const totalData = await orderMenu.aggregate([
      { $unwind: "$menu" },
      {
        $lookup: {
          from: "menus",
          localField: "menu.item",
          foreignField: "_id",
          as: "menuDetails"
        }
      },
      { $unwind: "$menuDetails" },
      {
        $match: {
          "menuDetails.restaurant": new mongoose.Types.ObjectId(restaurantId),
          "bankCode": { $in: bankCode },
          "menu.status": { $in: status },
          ...(search && {
            "menu._id": new mongoose.Types.ObjectId(search)
          })
        }
      },
      {
        $count: "total" // Đếm tổng số tài liệu sau khi apply filter
      }
    ]);
    
    const totalDocuments = totalData[0]?.total || 0;



    res.status(200).json({
      code:200,
      data:data,
      pagination:{
        page:page,
        limit:limit,
        total:totalDocuments
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

const editStatusMenu = async(req:Request,res:Response) => {
    try {
      const {idList,status}  = req.body
      
      
      for(const idObj of idList){
        await orderMenu.updateOne(
          { _id:idObj.orderId,"menu._id":idObj.menuId },
          {$set: {"menu.$.status":status}}
        )
      }

      res.status(200).json({
        code:200,
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
  createCheckoutSession,
  stripeHandlerWebHook,
  orderVNPAY,
  ipn_VNPAY,
  deleteAllOrder,
  getOrders,
  getOrderOfRestaurant,
  editStatusMenu
};
