
export const messageNotification = (success:boolean,amount:number,orderId:string) =>{
    if(success){
        const  message = {
            notification: {
              title: "Thanh toán thành công!",
              body: `Đơn hàng ${orderId} với số tiền ${amount}đ đã được xử lý.`,
            },
            data: {
              type: "PAYMENT_SUCCESS",
              orderId,
              amount: amount.toString(),
            },
        }
        return message
    }
    else{   
        const  message = {
            notification: {
              title: "Thanh toán thất bại!",
              body: `Đơn hàng ${orderId} của bạn chưa được xử lý`,
            },
            data: {
              type: "PAYMENT_FAIL",
              orderId,
              amount: amount.toString(),
            },
        }
        return message
    }   
}
