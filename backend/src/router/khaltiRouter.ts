import axios from "axios";
import express from "express";
import { redirect } from "react-router-dom";
import { prisma } from "../prismaClient";
export const khaltiRouter = express();
khaltiRouter.post("/create", async (req, res) => {
  const { amount, products, auctionId } = JSON.parse(JSON.stringify(req.body));
  await prisma.auctionItems.update({
    where: {
      id: auctionId,
    },
    data: {
      status: "SOLD",
    },
  });
  const formData = {
    return_url: "http://localhost:5173",
    website_url: "http://localhost:5173",
    amount: amount * 100,
    purchase_order_id: 2,
    purchase_order_name: products[0].product,
  };
  callKhalti(formData, req, res);
});
const callKhalti = async (formData: any, req: any, res: any) => {
  const headers = {
    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
  const response = await axios.post(
    "https://a.khalti.com/api/v2/epayment/initiate/",
    formData,
    {
      headers,
    }
  );
  res.json({
    message: "khalti success",
    payment_method: "khalti",
    data: response.data,
  });
};
khaltiRouter.get("/callback", async (req, res) => {
  const { txnId, pidx, amount, purchase_order_id, transaction_id, message } =
    req.query;
  const headers = {
    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
  redirect("/");
  const response = await axios.post(
    "https://a.khalti.com/api/v2/epayment/lookup/",
    { pidx },
    { headers }
  );
  res.json({
    response: response.data,
  });
});
