import { useInfo } from "@/hooks/loggedinUser";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState, useRef } from "react";
import { Notification } from "./Notification";
import {
  FaPlus,
  FaSearch,
  FaSignInAlt,
  FaUser,
  FaUserPlus,
  FaChevronDown,
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
import { useAuth } from "@/Contexts/AuthContext";

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
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [notification, setNotification] = useState<NotificationType[]>([]);
  const userId = useInfo();
  const { items, setItems } = useSearch();
  const [category, setCategory] = useState("");
  const {setIsVerified,isVerified}=useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  
  const categories = [
    { value: "", label: "All Categories" },
    { value: "electronics", label: "Electronics" },
    { value: "vehicles", label: "Vehicles" },
    { value: "fashion", label: "Fashion" },
    { value: "art", label: "Art" },
    { value: "sports", label: "Sports" },
    { value: "books", label: "Books" },
    { value: "toys", label: "Toys" },
    { value: "tools", label: "Tools" },
    { value: "others", label: "Others" },
  ];

  useEffect(() => {
    async function fetchSearchResults() {
      const response = await fetchSearch(searchQuery, category);
      setItems(response.data.allItems);
    }
    fetchSearchResults();
  }, [searchQuery, setItems, category]);
  
  useEffect(()=>{
    if(isVerified===false){
      window.location.href="/resendverificationemail"
    }
  },[isVerified])
  
  useEffect(() => {
    if (!userId) return;

    async function getNotification() {
      try {
        const response = await fetchNotifications(userId);
        setNotification(response.data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }

    getNotification();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const newSocket = new WebSocket("ws://localhost:3001");
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log("connected");
    };

    newSocket.onmessage = async (message) => {
      try {
        const previousHighestBidder = Number(
          JSON.parse(message.data).previousHighestBidder
        );

        if (Number(userId) === previousHighestBidder) {
          const response = await fetchNotifications(userId);
          setNotification(response.data.notifications);
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    };

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
            setIsVerified(data.userInfo.isVerified);
          }
        }
      } catch (error) {
        console.error("Error verifying JWT:", error);
      }
    }

    jwtVerify();
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("logout");
    sessionStorage.removeItem("jwt");
    setisLoggedIn(false);
    window.location.href = "/signin";
    toast.success("Successfully logged out!");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategorySelect = (value: string) => {
    setCategory(value);
    setCategoryDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      
      // Check if click is outside the category dropdown
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-slate-900 shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-amber-500 flex items-center space-x-2 hover:text-amber-400 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.5 0h-11C4.673 0 3 1.673 3 3.5v17C3 22.327 4.673 24 6.5 24h11c1.827 0 3.5-1.673 3.5-3.5v-17C21 1.673 19.327 0 17.5 0zm-6 3h2v2h-2V3zm7 16.5c0 .827-.673 1.5-1.5 1.5h-11c-.827 0-1.5-.673-1.5-1.5v-17c0-.827.673-1.5 1.5-1.5H9v2.5c0 .276.224.5.5.5h5c.276 0 .5-.224.5-.5V2h2.5c.827 0 1.5.673 1.5 1.5v17z" />
              </svg>
              <span className="tracking-wide">AuctionHub</span>
            </Link>
          </div>

          {/* Category Dropdown - Improved */}
          <div className="relative mx-2" ref={categoryDropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCategoryDropdownOpen(!categoryDropdownOpen);
              }}
              className="px-4 py-2 rounded-md bg-slate-800 text-white flex items-center justify-between space-x-2 min-w-40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 hover:bg-slate-700 transition duration-300"
            >
              <span>{categories.find(c => c.value === category)?.label || "All Categories"}</span>
              <FaChevronDown className={`transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {categoryDropdownOpen && (
              <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg py-1 z-50 max-h-64 overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategorySelect(cat.value);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                      category === cat.value ? 'text-amber-600 font-medium bg-amber-50' : 'text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input - Enhanced */}
          <form onSubmit={handleSearch} className="flex-1 mx-4 max-w-md">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 group-hover:bg-slate-700 transition duration-300"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </div>
          </form>

          {/* Notification Icon - Enhanced */}
          <div className="mr-2">
            <Notification notifications={notification} />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            {!isloggedIn && (
              <div className="flex items-center space-x-4">
                <Link
                  to="/signin"
                  className="text-white hover:text-amber-400 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition"
                >
                  Sign Up
                </Link>
                <Link
                  to="/admin/signin"
                  className="text-white hover:text-amber-400 transition"
                >
                  Admin
                </Link>
              </div>
            )}
            {isloggedIn && (
              <div className="flex items-center space-x-4 relative">
                {/* Add Items Button - Enhanced */}
                <Link
                  to="/add-item"
                  className="flex items-center space-x-1 text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-md transition duration-300"
                >
                  <FaPlus className="mr-1" />
                  <span>Add Item</span>
                </Link>

                {/* User Profile Dropdown - Enhanced */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                    }}
                    className="focus:outline-none flex items-center space-x-2"
                  >
                    {photo && photo !== "something" ? (
                      <div className="relative">
                        <img
                          src={photo}
                          alt="User profile"
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-500 hover:border-amber-400 transition duration-300"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition duration-300">
                        <FaUser className="text-white" />
                      </div>
                    )}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-slate-100">
                      {name && (
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-sm font-medium text-slate-900">{name}</p>
                        </div>
                      )}
                      <Link
                        to="/user/profile"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(false);
                        }}
                      >
                        <FaUser className="mr-3 text-slate-400" />
                        Profile
                      </Link>
                      <Link
                        to="/user/items"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(false);
                        }}
                      >
                        <svg className="mr-3 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                        My Items
                      </Link>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 7V2.586L15.414 8H10z" clipRule="evenodd" />
                          <path d="M3 7a1 1 0 011-1h5a1 1 0 010 2H4a1 1 0 01-1-1z" />
                        </svg>
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