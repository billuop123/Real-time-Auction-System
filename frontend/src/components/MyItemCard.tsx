import React, { useState } from "react";
import { formatDistance } from "date-fns";

interface MyItemCardProps {
  id: string;
  startingPrice: number;
  name: string;
  description: string;
  deadline: Date;
  photo: string;
  onDelete?: (id: string) => void;
}

const MyItemCard: React.FC<MyItemCardProps> = ({
  id,
  startingPrice,
  name,
  description,
  deadline,
  photo,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const timeRemaining = formatDistance(new Date(deadline), new Date(), {
    addSuffix: true,
  });

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div className="relative max-w-sm rounded-lg overflow-hidden shadow-lg bg-white transition-transform duration-300 hover:scale-105">
      {/* Three-dot menu */}
      <div className="absolute top-2 left-2 z-10">
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600 hover:text-gray-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <button
                  onClick={handleDeleteClick}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:bg-red-100"
                  role="menuitem"
                >
                  Delete Item
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rest of the card remains the same */}
      <div className="relative">
        <img src={photo} alt={name} className="w-full h-48 object-cover" />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md">
          ${startingPrice.toFixed(2)}
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{name}</div>
        <p className="text-gray-700 text-base truncate">{description}</p>
      </div>

      <div className="px-6 pt-2 pb-4 flex justify-between items-center">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
          {timeRemaining}
        </span>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-sm transition duration-300">
          Bid Now
        </button>
      </div>
    </div>
  );
};

export default MyItemCard;
