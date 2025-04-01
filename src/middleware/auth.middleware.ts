import { userPayload } from "../util/auth";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN } from "../util/auth";

declare global {
    namespace Express {
        interface Request {
            user: userPayload;
        }
    }
}

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction) :void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.sendStatus(401);
        return
    } 
  
    const token = authHeader.split(" ")[1];

    jwt.verify(token, ACCESS_TOKEN as string, (err, user) => {
      if (err){
        res.status(403).json({
            status:403,
            data:[],
            message:"Token expired"
        })
      }

      req.user = user as userPayload;
      next();
    });
};


