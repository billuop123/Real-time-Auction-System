import { updateNotifications } from "@/helperFunctions/apiCalls";
import { useInfo } from "@/hooks/loggedinUser";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaRegBell, FaTimes } from "react-icons/fa";
// type Notification = {
//   id: string;
//   message: string;
//   // Add more fields as necessary
// };
type NotificationType = {
  auction: {
    photo: string;
    name: string;
  };
};

export function Notification({ notifications }: any) {
  console.log(notifications);
  const [isOpen, setIsOpen] = useState(false);
  const [safeNotifications, setSafeNotifications] = useState<
    NotificationType[]
  >([]);

  console.log(safeNotifications);
  const userId = useInfo();
  useEffect(() => {
    if (Array.isArray(notifications) && notifications.length > 0) {
      setSafeNotifications(notifications);
    }
  }, [notifications]);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const clearNotifications = async () => {
    setSafeNotifications([]);
    setIsOpen(false);
    updateNotifications(userId);
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      <button
        onClick={toggleNotifications}
        className="relative text-white bg-indigo-600/50 hover:bg-indigo-600/70
        backdrop-blur-sm p-2 rounded-full transition-colors duration-300
        focus:outline-none"
      >
        <FaRegBell className="text-2xl" />
        {safeNotifications.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white
            rounded-full w-5 h-5 flex items-center justify-center
            text-xs font-bold animate-pulse"
          >
            {safeNotifications.length}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 mt-3 w-[400px] bg-white
            rounded-xl shadow-2xl border border-gray-100 overflow-hidden
            z-50 max-h-[500px] flex flex-col"
          >
            {/* Header */}
            <div
              className="flex justify-between items-center
            px-5 py-4 bg-indigo-50 border-b border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                Notifications
                <span className="text-sm text-gray-500 ml-2">
                  ({safeNotifications.length})
                </span>
              </h3>
              <button
                onClick={toggleNotifications}
                className="text-gray-500 hover:text-gray-700
                transition-colors duration-300"
              >
                <FaTimes />
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-grow">
              {safeNotifications.length > 0 ? (
                <AnimatePresence>
                  {safeNotifications.map((notification, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center p-4 hover:bg-gray-50
                      border-b last:border-b-0 group cursor-pointer
                      transition-colors duration-300"
                    >
                      {notification?.auction?.photo ? (
                        <img
                          src={notification.auction.photo}
                          alt={notification.auction.name}
                          className="w-14 h-14 rounded-lg mr-4
                          object-cover shadow-md group-hover:shadow-lg
                          transition-shadow duration-300"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 bg-indigo-100
                        rounded-lg mr-4 flex items-center justify-center"
                        >
                          <FaRegBell className="text-white" />
                        </div>
                      )}
                      <div className="flex-grow">
                        <p
                          className="font-medium text-gray-800
                        group-hover:text-indigo-600 transition-colors"
                        >
                          {notification.auction.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          This item that you have bidded initially is outbidded
                          by someone
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Just now</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div
                  className="flex flex-col items-center
                justify-center py-10 text-gray-400"
                >
                  <FaRegBell className="text-4xl mb-4 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>

            {/* Clear All Button */}
            {safeNotifications.length > 0 && (
              <div className="px-5 py-3 bg-gray-50 border-t text-center">
                <button
                  onClick={clearNotifications}
                  className="text-red-500 hover:text-red-600
                  font-medium transition-colors duration-300
                  hover:underline"
                >
                  Clear All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
