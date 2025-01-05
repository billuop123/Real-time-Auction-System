import { useInfo } from "@/hooks/loggedinUser";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Notification } from "./Notification";
import {
  FaPlus,
  FaSearch,
  FaSignInAlt,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import { useSearch } from "@/Contexts/SearchItemContext";
import {
  fetchNotifications,
  fetchSearch,
  getUserInfo,
  loggedIn,
} from "@/helperFunctions/apiCalls";
import toast from "react-hot-toast";
interface DecodedToken {
  userId: string;
}
type NotificationType = {
  id: number;
  startingPrice: number;
  name: string;
  description: string;
  deadline: string;
  photo: string;
  userId: number;
  category: string;
};

const Navbar: React.FC = () => {
  const [isloggedIn, setisLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [notification, setNotification] = useState<NotificationType[]>([]);
  const userId = useInfo();
  const { items, setItems } = useSearch();
  const [category, setCategory] = useState("");
  useEffect(() => {
    async function fetchSearchResults() {
      const response = await fetchSearch(searchQuery, category);
      setItems(response.data.allItems);
    }
    fetchSearchResults();
  }, [searchQuery, setItems, category]);
  useEffect(() => {
    if (!userId) return; // Wait until userId is available

    async function getNotification() {
      try {
        const response = await fetchNotifications(userId);
        setNotification(response.data.notifications);
        console.log(response.data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }

    getNotification();
  }, [userId]);
  useEffect(() => {
    if (!userId) return; // Wait until userId is available

    const newSocket = new WebSocket("ws://localhost:3001");
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log("connected");
    };

    newSocket.onmessage = async (message) => {
      try {
        console.log(JSON.parse(message.data).previousHighestBidder);
        const previousHighestBidder = Number(
          JSON.parse(message.data).previousHighestBidder
        );
        console.log(userId, previousHighestBidder);
        if (Number(userId) === previousHighestBidder) {
          const response = await fetchNotifications(userId);
          console.log(response.data);
          setNotification(response.data.notifications);
          console.log(response.data.notifications);
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    };

    // Cleanup WebSocket on unmount
    return () => {
      if (newSocket) {
        newSocket.close();
        console.log("disconnected");
      }
    };
  }, [userId]);

  useEffect(() => {
    async function jwtVerify() {
      try {
        const jwt = sessionStorage.getItem("jwt");

        if (!jwt) return;

        const status = await loggedIn(jwt);

        if (status) {
          setisLoggedIn(true);

          const decodedToken = jwtDecode<DecodedToken>(jwt);
          const { userId } = decodedToken;

          if (userId) {
            const data = await getUserInfo(userId);
            setName(data.userInfo.name);
            setPhoto(data.userInfo.photo);
          }
        }
      } catch (error) {
        console.error("Error verifying JWT:", error);
      }
    }

    jwtVerify();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("jwt");
    setisLoggedIn(false);
    window.location.href = "/signin";
    toast.success("Successfully logged out!");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelect = function (e: any) {
    setCategory(e.target.value);
  };
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-white flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.5 0h-11C4.673 0 3 1.673 3 3.5v17C3 22.327 4.673 24 6.5 24h11c1.827 0 3.5-1.673 3.5-3.5v-17C21 1.673 19.327 0 17.5 0zm-6 3h2v2h-2V3zm7 16.5c0 .827-.673 1.5-1.5 1.5h-11c-.827 0-1.5-.673-1.5-1.5v-17c0-.827.673-1.5 1.5-1.5H9v2.5c0 .276.224.5.5.5h5c.276 0 .5-.224.5-.5V2h2.5c.827 0 1.5.673 1.5 1.5v17z" />
              </svg>
              <span>AuctionHub</span>
            </Link>
          </div>

          {/* Category Dropdown */}
          <div className="mx-4">
            <select
              className="px-4 py-2 rounded-md bg-white/20 text-white 
            focus:outline-none focus:ring-2 focus:ring-white/30 
            hover:bg-white/30 transition duration-300 
            appearance-none"
              onChange={handleSelect}
            >
              <option value="" className="text-gray-800">
                All
              </option>
              <option value="electronics" className="text-gray-800">
                ELECTRONICS
              </option>
              <option value="vehicles" className="text-gray-800">
                VEHICLES
              </option>
              <option value="fashion" className="text-gray-800">
                FASHION
              </option>
              <option value="art" className="text-gray-800">
                ART
              </option>
              <option value="sports" className="text-gray-800">
                SPORTS
              </option>
              <option value="books" className="text-gray-800">
                BOOKS
              </option>
              <option value="toys" className="text-gray-800">
                TOYS
              </option>
              <option value="tools" className="text-gray-800">
                TOOLS
              </option>
              <option value="others" className="text-gray-800">
                OTHERS
              </option>
            </select>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex-1 mx-4 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={handleSearchChange} // Use the handleSearchChange function here
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
            </div>
          </form>
          <div>
            <span>
              <Notification notifications={notification} />
            </span>
          </div>
          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            {!isloggedIn ? (
              <div className="flex space-x-4">
                <Link
                  to="/signin"
                  className="flex items-center space-x-2 text-white hover:bg-white/20 px-3 py-2 rounded-md transition"
                >
                  <FaSignInAlt />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center space-x-2 text-white hover:bg-white/20 px-3 py-2 rounded-md transition"
                >
                  <FaUserPlus />
                  <span>Signup</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4 relative">
                {/* Add Items */}
                <Link
                  to="/add-item"
                  className="text-white hover:bg-white/20 p-2 rounded-full transition"
                >
                  <FaPlus />
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="focus:outline-none"
                  >
                    {photo && photo !== "something" ? (
                      <img
                        src={photo}
                        alt="User profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <FaUser className="text-white" />
                      </div>
                    )}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/user/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/user/items"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Items
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
