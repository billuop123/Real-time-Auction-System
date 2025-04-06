import { useState } from "react";
import { formatDistance } from "date-fns";
import { Link } from "react-router-dom";
import { FaClock, FaTag, FaEye, FaTrash, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaGavel } from "react-icons/fa";

interface MyItemCardProps {
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
  onDelete: (itemId: string) => void;
  onResubmit: () => void;
}

const MyItemCard: React.FC<MyItemCardProps> = ({
  id,
  startingPrice,
  name,
  description,
  deadline,
  photo,
  status,
  approvalStatus,
  category,
  viewCount,
  onDelete,
  onResubmit,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const timeRemaining = formatDistance(new Date(deadline), new Date(), {
    addSuffix: true,
  });

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
    setShowDeleteModal(false);
  };

  const getStatusBadge = () => {
    switch (approvalStatus) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <FaHourglassHalf className="mr-1" />
            Pending
          </span>
        );
      case 'DISAPPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1" />
            Disapproved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Item Image */}
        <div className="relative h-48">
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Item Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-slate-800 truncate">{name}</h3>
            <span className="text-amber-600 font-medium">₹{startingPrice}</span>
          </div>

          <p className="text-slate-600 text-sm mb-4 line-clamp-2">{description}</p>

          <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
            <div className="flex items-center space-x-2">
              <FaTag className="text-amber-500" />
              <span>{category}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaEye className="text-amber-500" />
              <span>{viewCount} views</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <FaClock className="text-amber-500" />
              <span>{timeRemaining}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to={`/${id}`}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                View
              </Link>
              {approvalStatus === "DISAPPROVED" && (
                <button
                  onClick={onResubmit}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center"
                >
                  <FaGavel className="mr-1" />
                  Resubmit
                </button>
              )}
              <button
                onClick={handleDeleteClick}
                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Confirm Delete</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyItemCard;
