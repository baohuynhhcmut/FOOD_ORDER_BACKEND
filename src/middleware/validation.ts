import { body, validationResult } from "express-validator";
import { NextFunction, Request,Response } from "express";

const handleValidationError = (req:Request,res:Response,next:NextFunction) => {
    const error = validationResult(req)
    if(!error.isEmpty()){
        res.status(400).json({
            error: error.array()
        })
        return;
    }
    next()
}

export const validationMyUserRequest = [
    body("name").isString().notEmpty().withMessage('Name must be string')
    ,body("addressLine1").isString().notEmpty().withMessage('Address must be string')
    ,body("city").isString().notEmpty().withMessage('City must be string')
    ,body("country").isString().notEmpty().withMessage('Country must be string')
    ,handleValidationError
]

// export const validationMyResRequest = [
//     body("restaurantName").isString().notEmpty().withMessage('Name must be string')
//     ,body("deliveryPrice").isFloat({min:0}).withMessage('Address must be string')
//     ,body("estimateDeliveryTime").isInt({min:0}).withMessage('Address must be string')
//     ,body("city").isString().notEmpty().withMessage('City must be string')
//     ,body("country").isString().notEmpty().withMessage('Country must be string')
//     ,body("cuisine")
//     ,handleValidationError
// ]