import express from "express";
import { prisma } from "../prismaClient";
export const adminRouter = express();
adminRouter.get("/unapproveditems",async (req:any,res:any)=>{
    try{
        const items=await prisma.auctionItems.findMany({
            where:{
                isApproved:false
            }
        })
        return res.json({
            items
        })
    }
    catch(e){
        return res.json({
            Error:"Error fetching items"
        })
    }   
})
adminRouter.get("/items/:itemId",async(req:any,res:any)=>{
    const {itemId}=req.params;
    try{
        const updatedValue=await prisma.auctionItems.update({
            where:{
                id:Number(itemId)
            },
            data:{
               isApproved:true
            }
    
        })
        return res.json({
            updatedValue
        })
    }catch(err:any){
        return res.json({
            error:`Failed to approve item ${err.message}`
        })
    }
    
})