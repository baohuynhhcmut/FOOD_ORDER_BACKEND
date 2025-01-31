
import { NextFunction, Request, Response } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import jwt from 'jsonwebtoken'
import User from '../model/user';

declare global{
    namespace Express{
        interface Request{
            auth0ID:string
            userID:string
        }
    }
}

export const jwtCheck = auth({
    audience: process.env.AUDIENCE,
    issuerBaseURL: process.env.BASE_URL,
    tokenSigningAlg: 'RS256'
});

export const jwtParse = async (req:Request,res:Response,next:NextFunction) : Promise<void> => {
    const {authorization} = req.headers
    if(!authorization || !authorization.startsWith('Bearer ')){
        res.sendStatus(401)
        return;
    }

    const token = authorization.split(' ')[1];
    try {
        const decode = jwt.decode(token) as jwt.JwtPayload
        const auth0ID = decode.sub 
        
        const user = await User.findOne({auth0ID: auth0ID})

        if(!user){
            res.sendStatus(401)
            return;
        }
        req.auth0ID = user.auth0ID as string
        req.userID = user._id.toString() 
        next()
    } catch (error) {
        console.log(error)
        res.sendStatus(401)
        return;
    }
}