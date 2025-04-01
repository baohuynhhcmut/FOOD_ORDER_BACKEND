export interface query {
    email:string,
    restaurantName?:string,
    city?:string,
    date:{
        from:Date,
        to:Date
    }
}

