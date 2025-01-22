import { useInfo } from "@/hooks/loggedinUser";
import React, { useEffect, useState } from "react";
import AuctionItemForm from "./AuctionItemForm";

import { Spinner } from "@/components/SpinnerFullPage";
import { addItems, loggedIn } from "@/helperFunctions/apiCalls";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
type AuctionItemFormState = {
  name: string;
  description: string;
  photo: File | null;
  deadline: Date | null;
  startingPrice: number;
  selectedCategory: string;

  userId?: string;
};

export const AuctionItem: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userId = useInfo();
  const handleFormSubmit = async (formData: AuctionItemFormState) => {

    if (userId === null) return;

    formData.userId = userId;

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("deadline", formData.deadline!.toISOString());
    formDataToSend.append("startingPrice", formData.startingPrice.toString());

    formDataToSend.append("userId", formData.userId);
    formDataToSend.append("category", formData.selectedCategory);
    if (formData.photo) {
      formDataToSend.append("photo", formData.photo);
    }

    try {
      setIsLoading(true);
      const response = await addItems(formDataToSend, token);
      navigate("/");
      toast.success("Item successfully added");
    } catch (error) {
      console.error("Error uploading item:", error);
      toast.error("Failed to upload item");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!userId) return;
    async function isLoggedIn() {
      const jwt = sessionStorage.getItem("jwt");

      if (!jwt) {
        navigate("/signin");
      }

      const status = await loggedIn(jwt);

      if (!status) {
 
        navigate("/signin");
      }
   
      setIsLoggedIn(status);
    }
    isLoggedIn();
  }, [navigate, userId]);
  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <AuctionItemForm onSubmit={handleFormSubmit} />
      )}
    </div>
  );
};

export default AuctionItem;
