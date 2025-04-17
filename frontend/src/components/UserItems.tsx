import { useInfo } from "@/hooks/loggedinUser";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import MyItemCard from "./MyItemCard";
import { Link, useNavigate } from "react-router-dom";
import { FaBoxOpen, FaPlus, FaFilter, FaSort } from "react-icons/fa";
import { ResubmitModal } from "@/components/ResubmitModal";

// Define an interface for the item structure
interface Item {
  id: string;
  startingPrice: number;
  name: string;
  description: string;
  deadline: Date;
  photo: string;
  status: 'PENDING' | 'SOLD' | 'UNSOLD';
  approvalStatus: 'APPROVED' | 'DISAPPROVED' | 'PENDING';
  category: string;
  viewCount: number;
  createdAt: string;
}

export const UserItems: React.FC = () => {
  const userId = useInfo();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!userId) return;
    const isVerified = async () => {
      const response = await axios.post("http://localhost:3001/api/v1/user/isVerified", { userId });
      if (!response.data.isVerified) {
        navigate("/resendverificationemail");
      }
    };
    isVerified();
  }, [userId]);

  // Delete item handler
  const handleDeleteItem = async (itemId: string) => {
    try {
      const optimisticUpdate = items.filter((item) => item.id !== itemId);
      setItems(optimisticUpdate);

      await axios.delete(`http://localhost:3001/api/v1/item/${itemId}`,{
        headers:{
          Authorization:sessionStorage.getItem("jwt"),
        }
      });
      toast.success("Item deleted successfully");
    } catch (error) {
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
      toast.error("Failed to delete item");
      console.error("Delete item failed", error);
    }
  };

  // Filter and sort items
  const filteredItems = items.filter(item => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "PENDING") return item.approvalStatus === "PENDING";
    if (filterStatus === "APPROVED") return item.approvalStatus === "APPROVED";
    if (filterStatus === "DISAPPROVED") return item.approvalStatus === "DISAPPROVED";
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOption === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortOption === "price-high") {
      return b.startingPrice - a.startingPrice;
    } else if (sortOption === "price-low") {
      return a.startingPrice - b.startingPrice;
    }
    return 0;
  });

  // Handle item resubmission
  const handleResubmit = async (newDeadline: Date) => {
    if (!selectedItem) return;

    try {
      setIsResubmitting(true);
      const response = await axios.post(`http://localhost:3001/api/v1/admin/items/${selectedItem.id}/resubmit`, {
        deadline: newDeadline.toISOString()
      },{
        headers:{
          Authorization:sessionStorage.getItem("jwt"),
        }
      });
      
      // Update the item's status and deadline in the local state
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === selectedItem.id 
            ? { 
                ...item, 
                approvalStatus: "PENDING", 
                deadline: new Date(response.data.updatedValue.deadline) // Use the date from the response
              }
            : item
        )
      );
      
      toast.success("Item resubmitted for approval");
    } catch (error) {
      console.error("Error resubmitting item:", error);
      toast.error("Failed to resubmit item");
    } finally {
      setIsResubmitting(false);
      setShowResubmitModal(false);
      setSelectedItem(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-center p-8">
        <FaBoxOpen className="w-24 h-24 text-amber-300 mb-6" />
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
          No Items Found
        </h2>
        <p className="text-slate-500 mb-8">
          You haven't added any items yet. Start selling!
        </p>
        <Link
          to="/add-item"
          className="flex items-center space-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <FaPlus />
          <span>Add New Item</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <Toaster position="top-right" />

        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-4 md:mb-0">My Items</h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-slate-500" />
              <select
                className="bg-white border border-slate-200 text-slate-700 py-2 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Items</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="DISAPPROVED">Disapproved</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <FaSort className="text-slate-500" />
              <select
                className="bg-white border border-slate-200 text-slate-700 py-2 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="price-low">Price (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedItems.map((item) => (
            <MyItemCard
              key={item.id}
              id={item.id}
              startingPrice={item.startingPrice}
              name={item.name}
              description={item.description}
              deadline={item.deadline}
              photo={item.photo}
              status={item.status}
              approvalStatus={item.approvalStatus}
              category={item.category}
              viewCount={item.viewCount}
              onDelete={handleDeleteItem}
              onResubmit={() => {
                setSelectedItem(item);
                setShowResubmitModal(true);
              }}
            />
          ))}
        </div>

        {/* Resubmit Modal */}
        <ResubmitModal
          isOpen={showResubmitModal}
          onClose={() => {
            setShowResubmitModal(false);
            setSelectedItem(null);
          }}
          onConfirm={handleResubmit}
          itemName={selectedItem?.name || ""}
        />
      </div>
    </div>
  );
};
