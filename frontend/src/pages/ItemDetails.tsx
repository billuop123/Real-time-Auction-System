import {
  addBid,
  HighestBidderInfo,
  itemDetails,
  newNotification,
} from "@/helperFunctions/apiCalls";
import { useInfo } from "@/hooks/loggedinUser";
import axios from "axios";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaClock,
  FaEnvelope,
  FaExclamationCircle,
  FaHandHoldingUsd,
  FaTag,
  FaUser,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

interface User {
  name: string;
  photo: string;
}
type Bidder = {
  id: number;
  name: string;
  photo: string;
};
interface Item {
  id: number;
  startingPrice: number;
  name: string;
  description: string;
  deadline: string;
  photo: string;
  userId: number;
  user: User;
}

export const ItemDetails = function () {
  const { id } = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [loggedIn, setIsLoggedIn] = useState(false);
  const [showBidInput, setShowBidInput] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const userId = useInfo();
  const [noBids, setNoBids] = useState(false);
  const [highestBidder, setHighestBidder] = useState<Bidder | null>(null);
  const [highestPrice, setHighestPrice] = useState(0);
  const [previousHighestBidder, setPreviousHighestBidder] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    async function isLoggedIn() {
      console.log("use effect called");
      const jwt = sessionStorage.getItem("jwt");

      if (!jwt) {
        navigate("/signin");
      }

      const {
        data: { status },
      } = await axios.post("http://localhost:3001/api/v1/user/loggedIn", {
        jwtR: jwt,
      });
      console.log(status);
      if (!status) {
        console.log("This is being called");
        navigate("/signin");
      }
      setIsLoggedIn(status);
    }
    isLoggedIn();
  }, [navigate]);
  useEffect(() => {
    if (item === null) return;
    const deadlineDate = new Date(item.deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    if (diff <= 0) {
      setIsDisabled(true);
    }
  }, [item]);
  useEffect(() => {
    async function getDetails() {
      try {
        const item = await itemDetails(id);
        setItem(item);

        const { HighestBidder, HighestPrice, secondHighestBid } =
          await HighestBidderInfo(id);
        setHighestBidder(HighestBidder);
        setHighestPrice(Number(HighestPrice));
        setPreviousHighestBidder(Number(secondHighestBid));
      } catch (error) {
        console.error("Failed to fetch item or highest bidder details", error);
      }
    }
    getDetails();
  }, [id]);

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:3001");
    setSocket(newSocket);

    newSocket.onopen = () => console.log("WebSocket connected");
    newSocket.onmessage = async (message) => {
      try {
        const { auctionId } = JSON.parse(message.data);
        if (Number(auctionId) === Number(id)) {
          const { HighestBidder, HighestPrice, secondHighestBid } =
            await HighestBidderInfo(id);
          setHighestBidder(HighestBidder);
          setHighestPrice(Number(HighestPrice));
          setPreviousHighestBidder(Number(secondHighestBid));
        }
      } catch (error) {
        console.error("Failed to handle WebSocket message", error);
      }
    };

    return () => newSocket.close();
  }, [id]); // Removed dependencies for better sequential execution

  useEffect(() => {
    const interval = setInterval(() => {
      setItem((prevItem) => (prevItem ? { ...prevItem } : null));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!item) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
        <div className="spinner"></div>
      </div>
    );
  }

  const timeLeft = () => {
    const deadlineDate = new Date(item.deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff <= 0) {
      return "time's up";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const handlePlaceBid = () => {
    setShowBidInput(true);
  };

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBidAmount(value);

    const numericBid = Number(value);
    if (highestPrice) {
      if (numericBid <= highestPrice) {
        console.log("This is the shit1");
        setBidError(`Bid must be higher than Rs ${highestPrice.toFixed(2)}`);
      } else {
        setBidError("");
      }
    } else {
      if (numericBid <= item.startingPrice) {
        console.log(numericBid, item.startingPrice);
        console.log("This is the shit2");
        setBidError(
          `Bid must be higher than Rs ${item.startingPrice.toFixed(2)}`
        );
      } else {
        setBidError("");
      }
    }
  };
  const handleClick = async function () {
    const url = "http://localhost:3001/api/v1/khalti/create";
    const data = {
      amount: Number(highestPrice),
      products: [
        { product: item.name, amount: Number(highestPrice), quantity: 1 },
      ],
      payment_method: "khalti",
    };
    try {
      console.log(JSON.stringify(data));
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      // const response = await axios.post(
      //   url,
      //   {
      //     body: JSON.stringify(data), // No need to stringify
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData.data);
        khaltiCall(responseData.data);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };
  const khaltiCall = (data: any) => {
    window.location.href = data.payment_url;
  };
  const submitBid = async () => {
    const numericBid = Number(bidAmount);
    if (!userId) return;
    if (highestPrice) {
      if (numericBid > highestPrice) {
        try {
          await addBid(numericBid, userId, id);
          const { HighestBidder, HighestPrice, secondHighestBid } =
            await HighestBidderInfo(id);
          setHighestBidder(HighestBidder);
          setHighestPrice(Number(HighestPrice));
          setPreviousHighestBidder(Number(secondHighestBid));

          setShowBidInput(false);
          setBidAmount("");
          setBidError("");
          if (secondHighestBid) {
            await newNotification(secondHighestBid, id);
          }
          socket?.send(
            JSON.stringify({
              type: "new_bid",
              auctionId: id,
              price: numericBid,
              previousHighestBidder: Number(highestBidder!.id),
            })
          );
          toast.success("Bid successfully placed!");
        } catch (error) {
          console.error("Bid submission failed", error);
          setBidError("Failed to submit bid. Please try again.");
          toast.error("Failed to placed Bid.");
        }
      } else {
        setBidError(
          `Bid must be higher than Rs ${
            highestPrice ? highestPrice.toFixed(2) : item.startingPrice
          }`
        );
      }
    } else {
      if (numericBid > item.startingPrice) {
        try {
          await addBid(numericBid, userId, id);

          setShowBidInput(false);
          setBidAmount("");
          setBidError("");
          socket?.send(
            JSON.stringify({
              type: "new_bid",
              auctionId: id,
              price: numericBid,
            })
          );
          console.log("Bid submitted successfully");
        } catch (error) {
          console.error("Bid submission failed", error);
          setBidError("Failed to submit bid. Please try again.");
        }
      } else {
        setBidError(
          `Bid must be higher than Rs ${
            highestPrice ? highestPrice.toFixed(2) : item.startingPrice
          }`
        );
      }
    }
  };

  return (
    <>
      {showBidInput && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setShowBidInput(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-96 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBidInput(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Place Your Bid
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"></span>

                <input
                  type="number"
                  value={bidAmount}
                  onChange={handleBidChange}
                  placeholder={`Enter bid (Min: Rs ${
                    highestPrice
                      ? highestPrice.toFixed(2)
                      : item.startingPrice.toFixed(2)
                  })`}
                  className={`w-full pl-6 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    bidError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                  min={highestPrice ? highestPrice : item.startingPrice}
                  step="1"
                />
              </div>

              {bidError && (
                <div className="flex items-center space-x-2 text-red-500 text-sm">
                  <FaExclamationCircle />

                  <p>{bidError}</p>
                </div>
              )}

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowBidInput(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={submitBid}
                  disabled={
                    item.userId === Number(userId) ||
                    highestBidder?.id === Number(userId) ||
                    Number(bidAmount) <= highestPrice ||
                    Number(bidAmount) <= Number(item.startingPrice) ||
                    isDisabled
                  }
                  className={`flex-1 py-3 rounded-lg transition ${
                    bidError || !bidAmount
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Place Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden grid md:grid-cols-2 gap-0 border border-slate-100">
          {/* Image Section */}

          <div className="relative group">
            <img
              src={item.photo}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
          </div>

          {/* Details Section */}

          <div className="p-10 space-y-8 bg-white">
            {/* Seller Profile */}

            <div className="flex items-center space-x-6 pb-6 border-b border-slate-200">
              <img
                src={item.user.photo}
                alt={item.user.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100 shadow-lg"
              />

              <div>
                <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
                  <FaUser className="text-indigo-600" />

                  <span>{item.user.name}</span>
                </h3>

                <p className="text-slate-500 text-sm">Seller</p>
              </div>
            </div>

            {/* Item Details */}

            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                {item.name}
              </h1>

              <p className="text-slate-600 mb-6 leading-relaxed">
                {item.description}
              </p>

              {/* Metrics Grid */}

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-indigo-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <FaClock className="text-indigo-600 text-3xl mb-3" />

                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Time Left
                  </p>

                  <p className="text-lg font-bold text-indigo-800">
                    {timeLeft()}
                  </p>
                </div>

                <div className="bg-emerald-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <FaTag className="text-emerald-600 text-3xl mb-3" />

                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Starting Price
                  </p>

                  <p className="text-lg font-bold text-emerald-800">
                    Rs {item.startingPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}

            <div className="pt-6 space-y-4">
              <div className="flex space-x-4">
                <button
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-xl 

                hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 

                disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePlaceBid}
                  disabled={
                    item.userId === Number(userId) ||
                    highestBidder?.id === Number(userId) ||
                    isDisabled
                  }
                >
                  <FaHandHoldingUsd />

                  <span>Place Bid</span>
                </button>
                {Number(highestBidder?.id) === Number(userId) && isDisabled ? (
                  <button onClick={handleClick}>Buy item</button>
                ) : (
                  ""
                )}

                <button
                  className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl 

                hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
                  onClick={() => console.log("Contact Seller")}
                >
                  <FaEnvelope />

                  <span>Contact Seller</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Highest Bidder Section */}

        <div className="max-w-6xl mx-auto mt-8 bg-white rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Highest Bidder
          </h2>

          {noBids ? (
            <p className="text-slate-500 italic">No bids yet!</p>
          ) : highestBidder?.name ? (
            <div className="flex items-center space-x-6 bg-slate-50 p-4 rounded-xl">
              <img
                src={highestBidder.photo}
                alt={highestBidder.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-green-100"
              />

              <div>
                <p className="text-slate-800 text-lg font-medium">
                  {highestBidder.name}
                </p>

                <p className="text-green-600 font-bold text-xl">
                  Rs {highestPrice.toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 italic">There are no bids</p>
          )}
          <div className="text-sm text-red-500 font-semibold text-center">
            {item.userId === Number(userId)
              ? "Seller cannot buy his own item."
              : ""}
            {highestBidder?.id === Number(userId)
              ? "You are already the highest bidder!"
              : ""}
          </div>
          <div className="text-sm text-green-500 font-semibold text-center">
            {highestBidder?.id === Number(userId) && isDisabled
              ? "You have already won this bid"
              : ""}
            {highestBidder?.id !== Number(userId) && isDisabled
              ? `${highestBidder?.name} have already won this bid`
              : ""}
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemDetails;
