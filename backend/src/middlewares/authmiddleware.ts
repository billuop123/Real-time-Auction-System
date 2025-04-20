import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";
export const authMiddleware=async (req:any, res:any, next:any)=>{
  
    const jwtT=req.headers.authorization;
    if(!jwt){
        return res.status(401).json({message:"Unauthorized"});
    }
    console.log(jwt);
    try{
        const decoded=jwt.verify(jwtT, JWT_SECRET);
        console.log(decoded)
        req.user=decoded;
        next();
    }catch(error:any){
        return res.status(401).json({message:"Unauthorized",
            error:`${error.message}`
        });
    }
  
}