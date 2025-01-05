import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaClock, FaTag, FaEye } from "react-icons/fa";

interface ItemCardProps {
  deadline: string;
  startingPrice: number;
  name: string;
  description: string;
  id: string;
  photo?: string;
  userId: string;
}

export const ItemCard: React.FC<ItemCardProps> = function ({
  deadline,
  startingPrice,
  name,
  description,
  id,
  photo,
  userId,
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isAuctionFinished, setIsAuctionFinished] = useState(false);

  useEffect(() => {
    const targetDate = new Date(deadline).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setIsAuctionFinished(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className="max-w-sm bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      {/* Image Section */}
      {photo && (
        <div className="relative h-64 overflow-hidden">
          <img
            src={photo}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          {isAuctionFinished && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs">
              Closed
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Item Name */}
        <h3 className="text-xl font-bold text-gray-900 truncate">{name}</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

        {/* Timer and Price Row */}
        <div className="flex justify-between items-center">
          {/* Time Left */}
          <div className="flex items-center space-x-2">
            <FaClock className="text-indigo-600" />
            {isAuctionFinished ? (
              <span className="text-sm text-red-500 font-medium">
                Auction Finished
              </span>
            ) : (
              <span className="text-sm text-gray-600">
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
              </span>
            )}
          </div>

          {/* Starting Price */}
          <div className="flex items-center space-x-2">
            <FaTag className="text-green-600" />
            <span className="text-sm font-medium text-gray-800">
              Rs {startingPrice.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Link
            to={`/${id}`}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            <FaEye />
            <span>View Details</span>
          </Link>
          <p className="text-sm text-gray-500">
            Seller ID: <span className="font-medium">{userId}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
