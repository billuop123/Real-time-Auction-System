import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";
export const adminMiddleware=async (req:any, res:any, next:any)=>{
  
    const jwtT=req.headers.authorization;
    if(!jwt){
        return res.status(401).json({message:"Unauthorized"});
    }
    console.log(jwtT);
    try{
        const decoded=jwt.verify(jwtT, JWT_SECRET);
        console.log("-------")
        //@ts-ignore
        console.log(decoded.role);
        //@ts-ignore
        if(decoded.role!="ADMIN"){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.user=decoded;
        next();
    }catch(error:any){
        return res.status(401).json({message:"Unauthorized",
            error:`${error.message}`
        });
    }
  
}