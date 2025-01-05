import { useInfo } from "@/hooks/loggedinUser";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast"; // Added toast for notifications
import MyItemCard from "./MyItemCard";
import { Link } from "react-router-dom";

// Define an interface for the item structure
interface Item {
  id: string;
  startingPrice: number;
  name: string;
  description: string;
  deadline: Date;
  photo: string;
}

export const UserItems: React.FC = () => {
  const userId = useInfo();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user items
  useEffect(() => {
    const fetchUserItems = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.post(
          "http://localhost:3001/api/v1/user/user-items/",
          { userId }
        );

        setItems(response.data.items);
        setError(null);
      } catch (err) {
        setError("Failed to fetch items. Please try again.");
        console.error(err);
        toast.error("Failed to fetch items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserItems();
  }, [userId]);

  // Delete item handler
  const handleDeleteItem = async (itemId: string) => {
    try {
      // Optimistic update
      const optimisticUpdate = items.filter((item) => item.id !== itemId);
      setItems(optimisticUpdate);

      // Delete API call
      await axios.delete(`http://localhost:3001/api/v1/item/${itemId}`);

      // Show success toast
      toast.success("Item deleted successfully");
    } catch (error) {
      // Revert optimistic update on error
      const fetchUserItems = async () => {
        try {
          const response = await axios.post(
            "http://localhost:3001/api/v1/user/user-items/",
            { userId }
          );
          setItems(response.data.items);
        } catch (err) {
          console.error(err);
        }
      };

      fetchUserItems();

      // Show error toast
      toast.error("Failed to delete item");
      console.error("Delete item failed", error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <svg
          className="w-24 h-24 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">
          No Items Found
        </h2>
        <p className="text-gray-500">
          You haven't added any items yet. Start selling!
        </p>
        <Link
          to={"/add-item"}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
        >
          Add New Item
        </Link>
      </div>
    );
  }

  // Render items
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add Toaster for notifications */}
      <Toaster position="top-right" />

      <h1 className="text-3xl font-bold mb-6 text-center">My Items</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <MyItemCard
            id={item.id}
            key={item.id}
            startingPrice={item.startingPrice}
            name={item.name}
            description={item.description}
            deadline={item.deadline}
            photo={item.photo}
            onDelete={handleDeleteItem} // Pass delete handler
          />
        ))}
      </div>
    </div>
  );
};
