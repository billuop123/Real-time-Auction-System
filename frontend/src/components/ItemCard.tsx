import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaClock, FaTag, FaEye, FaFire } from "react-icons/fa";

interface ItemCardProps {
  deadline: string;
  startingPrice: number;
  name: string;
  description: string;
  id: number;
  photo?: string;
  userId: number;
  highlight?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = function ({
  deadline,
  startingPrice,
  name,
  description,
  id,
  photo,
  userId,
  highlight = false,
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

  // Calculate if time is running low (less than 3 hours)
  const isTimeCritical = 
    !isAuctionFinished && 
    timeLeft.days === 0 && 
    timeLeft.hours < 3;

  return (
    <div 
      className={`max-w-sm bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 ${
        highlight 
          ? "ring-2 ring-orange-400 shadow-lg hover:shadow-2xl" 
          : "shadow-md hover:shadow-xl"
      }`}
    >
      {/* Image Section */}
      {photo && (
        <div className="relative h-64 overflow-hidden">
          <img
            src={photo}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          
          {/* Status indicators */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between">
            {highlight && !isAuctionFinished && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <FaFire className="mr-1" />
                Ending Soon
              </div>
            )}
            
            {isAuctionFinished && (
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Closed
              </div>
            )}
          </div>
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
            {isTimeCritical ? (
              <FaClock className="text-red-600 animate-pulse" />
            ) : (
              <FaClock className={highlight ? "text-orange-600" : "text-indigo-600"} />
            )}
            
            {isAuctionFinished ? (
              <span className="text-sm text-red-500 font-medium">
                Auction Finished
              </span>
            ) : isTimeCritical ? (
              <span className="text-sm text-red-600 font-medium">
                {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            ) : (
              <span className={`text-sm ${highlight ? "text-orange-600 font-medium" : "text-gray-600"}`}>
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
              </span>
            )}
          </div>

          {/* Starting Price */}
          <div className="flex items-center space-x-2">
            <FaTag className="text-green-600" />
            <span className="text-sm font-medium text-gray-800">
            ₹ {startingPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Link
            to={`/${id}`}
            className={`flex items-center space-x-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition ${
              highlight 
                ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" 
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <FaEye />
            <span>View Details</span>
          </Link>
          <p className="text-xs text-gray-500 truncate max-w-[120px]">
            {/* ID: <span className="font-medium">{userId.substring(0, 8)}...</span> */}
          </p>
        </div>
      </div>
    </div>
  );
};