import axios from "axios";
import { prisma } from "../prismaClient";

export const createPayment = async (req: any, res: any) => {
    const { amount, products, auctionId } = JSON.parse(JSON.stringify(req.body));
  
    const formData = {
      return_url: `http://localhost:5173/${auctionId}`,
      website_url: "http://localhost:5173",
      amount: amount * 100,
      purchase_order_id: auctionId,
      purchase_order_name: products[0].product,
    };
    callKhalti(formData, req, res);
  }
  const callKhalti = async (formData: any, req: any, res: any) => {
    const headers = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };
  
    try {
      const response = await axios.post(
        "https://a.khalti.com/api/v2/epayment/initiate/",
        formData,
        { headers }
      );
  
      await prisma.payment.create({
        data: {
         
          pidx: response.data.pidx, 
          auctionId: String(formData.purchase_order_id), 
        },
      });
  
      res.json({
        message: "Khalti success",
        payment_method: "khalti",
        data: response.data,
      });
    } catch (error) {
      console.error("Khalti Payment Error:", error);
      res.status(500).json({ message: "Error processing payment", error });
    }
  };
  export const khaltiCallback = async (req: any, res: any) => {
    const { pidx } = req.query;
  
    const headers = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };
  
    try {
      const response = await axios.post(
        "https://a.khalti.com/api/v2/epayment/lookup/",
        { pidx },
        { headers }
      );
    
      const paymentStatus = response.data.status;
      
  
      if (paymentStatus === "Completed") {
        // ✅ Fetch auctionId from the database using `pidx`
      
        const paymentRecord = await prisma.payment.findUnique({
          where: { pidx },
        });
  
        if (!paymentRecord) {
          return res.status(400).json({ message: "No matching payment found" });
        }
  

        await prisma.auctionItems.update({
          where: {
            id: Number(paymentRecord.auctionId), 
          },
          data: {
            status: "SOLD",
          },
        });
  
        return res.json({
          message: "Payment successful",
          payment_status: "Completed",
          transaction_data: response.data,
        });
      } else {
        return res.json({
          message: "Payment not completed",
          payment_status: paymentStatus,
          transaction_data: response.data,
        });
      }
    } catch (error) {
      console.error("Khalti Lookup Error:", error);
      return res.status(500).json({ message: "Error verifying payment", error });
    }
  }