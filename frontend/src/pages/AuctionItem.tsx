import React, { useEffect, useState } from "react";
import AuctionItemForm from "./AuctionItemForm";
import axios from "axios";
import { useInfo } from "@/hooks/loggedinUser";

import { useNavigate } from "react-router-dom";
import { addItems, loggedIn } from "@/helperFunctions/apiCalls";
import { Spinner } from "@/components/SpinnerFullPage";
import toast from "react-hot-toast";
type AuctionItemFormState = {
  name: string;
  description: string;
  photo: File | null;
  deadline: Date | null;
  startingPrice: number;
  selectedCategory: string;
  // status?: string;
  userId?: string;
};

export const AuctionItem: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // Assuming `useInfo` returns a user ID
  const token = sessionStorage.getItem("token");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userId = useInfo();
  const handleFormSubmit = async (formData: AuctionItemFormState) => {
    console.log("Form Data:", formData);
    if (userId === null) return;
    // Attach userId to form data
    formData.userId = userId;

    // Create a FormData object to handle file uploads and form fields
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("deadline", formData.deadline!.toISOString()); // Send as ISO string
    formDataToSend.append("startingPrice", formData.startingPrice.toString());
    // formDataToSend.append("status", formData.status);
    formDataToSend.append("userId", formData.userId);
    formDataToSend.append("category", formData.selectedCategory);
    if (formData.photo) {
      formDataToSend.append("photo", formData.photo); // Append the file
    }

    try {
      setIsLoading(true);
      const response = await addItems(formDataToSend, token);
      navigate("/"); // Navigate to the shop page
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
      console.log(jwt);
      if (!jwt) {
        navigate("/signin");
      }

      const status = await loggedIn(jwt);

      if (!status) {
        console.log("This is being called");
        navigate("/signin");
      }
      console.log("This is haha");
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
