import { useEffect, useState } from "react";
import { useInfo } from "@/hooks/loggedinUser";
import { ResubmitModal } from "@/components/ResubmitModal";
import { resubmitItem } from "@/helperFunctions/apiCalls";
import toast from "react-hot-toast";
import { FaGavel, FaClock, FaTag, FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

interface Item {
  id: number;
  name: string;
  description: string;
  photo: string;
  startingPrice: number;
  deadline: string;
  approvalStatus: string;
  status: string;
}

export const UserItems = () => {
  const userId = useInfo();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);

  useEffect(() => {
    const fetchUserItems = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/v1/user/items/${userId}`,{
          headers:{
            Authorization: sessionStorage.getItem("jwt"),
          }
        });
        setItems(response.data.items);
      } catch (error) {
        console.error("Error fetching user items:", error);
        toast.error("Failed to fetch your items");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserItems();
    }
  }, [userId]);

  const handleResubmit = async () => {
    if (!selectedItem) return;

    try {
      setIsResubmitting(true);
      await resubmitItem(selectedItem.id.toString());
      toast.success("Item resubmitted for approval");
      
      // Update the item's status in the local state
      setItems(items.map(item => 
        item.id === selectedItem.id 
          ? { ...item, approvalStatus: "PENDING" }
          : item
      ));
    } catch (error) {
      console.error("Error resubmitting item:", error);
      toast.error("Failed to resubmit item");
    } finally {
      setIsResubmitting(false);
      setShowResubmitModal(false);
      setSelectedItem(null);
    }
  };

  const getStatusBadge = (status: string, approvalStatus: string) => {
    if (approvalStatus === "DISAPPROVED") {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center">
          <FaExclamationTriangle className="mr-1" />
          Disapproved
        </span>
      );
    }
    if (approvalStatus === "PENDING") {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
          Pending Approval
        </span>
      );
    }
    if (status === "SOLD") {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Sold
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Auction Items</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Image Section */}
              <div className="relative h-48">
                <img
                  src={item.photo}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(item.status, item.approvalStatus)}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.name}</h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                {/* Details */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center text-slate-600">
                    <FaTag className="mr-2 text-amber-500" />
                    <span className="font-medium">Rs {item.startingPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <FaClock className="mr-2 text-amber-500" />
                    <span className="text-sm">
                      {new Date(item.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <Link
                    to={`/${item.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View Details
                  </Link>

                  {(item.approvalStatus === "DISAPPROVED" || (item.status === "ACTIVE" && new Date(item.deadline) < new Date())) && (
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowResubmitModal(true);
                      }}
                      className="flex items-center px-3 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
                      disabled={isResubmitting}
                    >
                      {isResubmitting && selectedItem?.id === item.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                      ) : (
                        <FaGavel className="mr-2" />
                      )}
                      Resubmit
                    </button>
                  )}
                </div>
              </div>
            </div>
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

export default UserItems; 
