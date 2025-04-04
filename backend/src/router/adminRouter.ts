import express from "express";
import { prisma } from "../prismaClient";
export const adminRouter = express();
adminRouter.get("/unapproveditems",async (req:any,res:any)=>{
    try{
        const items=await prisma.auctionItems.findMany({
            where:{
                approvalStatus:"PENDING"
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
               approvalStatus:"APPROVED"
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
adminRouter.post("/disapprove/:itemId",  async (req: any, res: any) => {
    const { itemId } = req.params;
    try{
      await prisma.auctionItems.update({
        where: { id: Number(itemId) },
        data: { approvalStatus: "DISAPPROVED" },
      });
      return res.json({
        status: "Item successfully disapproved",
      });
    } catch (error) {
      console.error("Error disapproving item:", error);
      return res.status(500).json({ error: "Error disapproving item" });
    }
  })
  adminRouter.post("/featured/:itemId",async(req:any,res:any)=>{
    const {itemId}=req.params;
    const {featured}=req.body;
    try{
        const updatedValue=await prisma.auctionItems.update({
            where:{
                id:Number(itemId)
            },
            data:{
                featured
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