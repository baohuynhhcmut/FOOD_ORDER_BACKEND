import jwt from "jsonwebtoken"

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const REFRESH_TOKEN =  process.env.REFRESH_TOKEN

export const generateAccessToken = (user: userPayload) => {
    return jwt.sign(user, ACCESS_TOKEN as string, { expiresIn: "1d" });
};
  
export const generateRefreshToken = (user: userPayload) => {
    return jwt.sign(user, REFRESH_TOKEN as string, { expiresIn: "7d" });
};

export { ACCESS_TOKEN, REFRESH_TOKEN };

export interface userPayload {
    email:string,
    phoneNumber:string
}
