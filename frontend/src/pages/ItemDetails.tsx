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
  FaTrophy,
  FaHourglassEnd,
  FaShoppingCart,
  FaArrowLeft,
  FaGavel,
  FaMoneyBillWave,
  FaTimes,
} from "react-icons/fa";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

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
  status: string;
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
  const [timeRemaining, setTimeRemaining] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pidx = searchParams.get("pidx");
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    if (pidx) {
      setIsDisabled(true);
      axios
        .get(`http://localhost:3001/api/v1/khalti/callback?pidx=${pidx}`)
        .then((response) => {
          console.log("Payment Verified:", response.data);
        })
        .catch((error) => {
          console.error("Error verifying payment:", error);
        })
        .finally(() => {
          setIsDisabled(false);
        });
    }
  }, [pidx]);
useEffect(()=>{
  if(!userId) return;
const isVerified=async()=>{
  const response=await axios.post("http://localhost:3001/api/v1/user/isVerified",{userId})
  if(!response.data.isVerified){
    navigate("/resendverificationemail")
  }
}
isVerified()
},[userId])
  useEffect(() => {
    async function isLoggedIn() {
      const jwt = sessionStorage.getItem("jwt");

      if (!jwt) {
        navigate("/signin");
      }

      const {
        data: { status },
      } = await axios.post("http://localhost:3001/api/v1/user/loggedIn", {
        jwtR: jwt,
      });

      if (!status) {
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
        setNoBids(HighestBidder==="no bids");
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
          setNoBids(HighestBidder==="no bids");
        }
      } catch (error) {
        console.error("Failed to handle WebSocket message", error);
      }
    };

    return () => newSocket.close();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (item) {
        setTimeRemaining(calculateTimeLeft());
        
        // Check if deadline has passed
        const deadlineDate = new Date(item.deadline);
        const now = new Date();
        if (deadlineDate.getTime() <= now.getTime()) {
          setIsDisabled(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [item]);

  const calculateTimeLeft = () => {
    if (!item) return "";
    
    const deadlineDate = new Date(item.deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff <= 0) {
      return "Auction ended";
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
        setBidError(`Bid must be higher than Rs ${highestPrice.toFixed(2)}`);
      } else {
        setBidError("");
      }
    } else {
      if (numericBid <= item!.startingPrice) {
        setBidError(
          `Bid must be higher than Rs ${item!.startingPrice.toFixed(2)}`
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
      auctionId: Number(id),
      products: [
        { product: item!.name, amount: Number(highestPrice), quantity: 1 },
      ],
      payment_method: "khalti",
    };
    try {
      toast.loading("Redirecting to payment gateway...");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const responseData = await response.json();
        khaltiCall(responseData.data);
      }
    } catch (error) {
      toast.error("Payment initialization failed. Please try again.");
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
          toast.loading("Processing your bid...");
          await addBid(numericBid, userId, id);
          const { HighestBidder, HighestPrice, secondHighestBid } =
            await HighestBidderInfo(id);
          setHighestBidder(HighestBidder);
          setHighestPrice(Number(HighestPrice));
          setPreviousHighestBidder(Number(secondHighestBid));

          setShowBidInput(false);
          setBidAmount("");
          setBidError("");
          setNoBids(false);
          
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
          toast.dismiss();
          toast.success("Bid successfully placed!");
        } catch (error) {
          toast.dismiss();
          console.error("Bid submission failed", error);
          setBidError("Failed to submit bid. Please try again.");
          toast.error("Failed to place bid.");
        }
      } else {
        setBidError(
          `Bid must be higher than Rs ${highestPrice.toFixed(2)}`
        );
      }
    } else {
      if (numericBid > item!.startingPrice) {
        try {
          toast.loading("Processing your bid...");
          await addBid(numericBid, userId, id);
          
          const { HighestBidder, HighestPrice } = await HighestBidderInfo(id);
          setHighestBidder(HighestBidder);
          setHighestPrice(Number(HighestPrice));
          setNoBids(false);

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
          
          toast.dismiss();
          toast.success("Bid successfully placed!");
        } catch (error) {
          toast.dismiss();
          console.error("Bid submission failed", error);
          setBidError("Failed to submit bid. Please try again.");
          toast.error("Failed to place bid.");
        }
      } else {
        setBidError(
          `Bid must be higher than Rs ${item!.startingPrice.toFixed(2)}`
        );
      }
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const handleContactSeller = async () => {
    if (!contactMessage.trim()) {
      setContactError("Please enter a message");
      return;
    }

    setIsSending(true);
    setContactError("");

    try {
      const response = await axios.post("http://localhost:3001/api/v1/item/contact-seller", {
        itemId: id,
        buyerId: userId,
        message: contactMessage
      });

      toast.success("Message sent successfully!");
      setShowContactModal(false);
      setContactMessage("");
    } catch (error: any) {
      console.error("Error contacting seller:", error);
      setContactError(error.response?.data?.error || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (!item) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent border-solid rounded-full animate-spin mb-4"></div>
        <p className="text-indigo-800 font-medium">Loading auction details...</p>
      </div>
    );
  }

  const isWinner = Number(highestBidder?.id) === Number(userId) && isDisabled;
  const isOwner = item.userId === Number(userId);
  
  return (
    <>
      {showBidInput && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setShowBidInput(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-96 relative transform transition-all duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBidInput(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors"
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

            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              Place Your Bid
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <FaMoneyBillWave className="text-amber-500" />
                </span>

                <input
                  type="number"
                  value={bidAmount}
                  onChange={handleBidChange}
                  placeholder={`Enter bid (Min: Rs ${
                    highestPrice
                      ? (highestPrice + 1).toFixed(2)
                      : (item.startingPrice + 1).toFixed(2)
                  })`}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    bidError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-200 focus:ring-amber-500"
                  }`}
                  min={highestPrice ? highestPrice + 1 : item.startingPrice + 1}
                  step="1"
                />
              </div>

              {bidError && (
                <div className="flex items-center space-x-2 text-red-500 text-sm p-2 bg-red-50 rounded-lg">
                  <FaExclamationCircle />
                  <p>{bidError}</p>
                </div>
              )}

              <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-700 flex items-start space-x-2">
                <FaGavel className="mt-1 flex-shrink-0" />
                <p>
                  Your bid must be at least Rs 1 more than the current highest bid.
                  Once placed, bids cannot be retracted.
                </p>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowBidInput(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={submitBid}
                  disabled={
                    isOwner ||
                    highestBidder?.id === Number(userId) ||
                    Number(bidAmount) <= highestPrice ||
                    Number(bidAmount) <= Number(item.startingPrice) ||
                    isDisabled ||
                    !bidAmount
                  }
                  className={`flex-1 py-3 rounded-lg transition ${
                    bidError || !bidAmount || isOwner || isDisabled || highestBidder?.id === Number(userId)
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                >
                  Place Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <button 
            onClick={goBack}
            className="mb-6 flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors"
          >
            <FaArrowLeft /> 
            <span>Back to auctions</span>
          </button>
          
          {/* Status banner for sold items */}
          {item.status === "SOLD" && (
            <div className="mb-6 bg-green-600 text-white p-4 rounded-xl shadow-md flex items-center justify-center space-x-3">
              <FaTrophy className="text-yellow-300 text-xl" />
              <span className="font-medium">This item has been sold to {highestBidder?.name}</span>
            </div>
          )}
          
          {/* Main content card */}
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden grid md:grid-cols-2 gap-0 border border-slate-100">
            {/* Image Section */}
            <div className="relative group h-full">
              <img
                src={item.photo}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Time left badge on image */}
              <div className="absolute top-4 right-4">
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isDisabled 
                    ? "bg-red-500 text-white" 
                    : "bg-amber-500 text-white"
                } shadow-lg flex items-center space-x-2`}>
                  {isDisabled ? <FaHourglassEnd /> : <FaClock />}
                  <span>{timeRemaining}</span>
                </div>
              </div>
              
              {/* Winner badge */}
              {isDisabled && highestBidder && (
                <div className="absolute left-0 bottom-0 w-full bg-black/70 text-white p-4 flex items-center justify-center space-x-2">
                  <FaTrophy className="text-yellow-400" />
                  <span className="font-medium">
                    {isWinner ? "You won this auction!" : `${highestBidder.name} won this auction`}
                  </span>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-10 space-y-8 bg-white flex flex-col justify-between">
              {/* Item Info */}
              <div>
                {/* Seller Profile */}
                <div className="flex items-center space-x-6 pb-6 border-b border-slate-100">
                  <img
                    src={item.user.photo}
                    alt={item.user.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-100 shadow-lg"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
                      <FaUser className="text-amber-500" />
                      <span>{item.user.name}</span>
                    </h3>
                    <p className="text-slate-500 text-sm">Seller</p>
                  </div>
                </div>

                {/* Item Details */}
                <div className="pt-6">
                  <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                    {item.name}
                  </h1>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                      <FaClock className="text-amber-600 text-2xl mb-2" />
                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Auction Ends
                      </p>
                      <p className="text-lg font-bold text-amber-800">
                        {new Date(item.deadline).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                      <FaTag className="text-emerald-600 text-2xl mb-2" />
                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Starting Price
                      </p>
                      <p className="text-lg font-bold text-emerald-800">
                        Rs {item.startingPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Current highest bid card */}
              <div className="bg-slate-50 rounded-xl p-4 shadow-sm border border-slate-100">
                <h3 className="text-slate-700 font-medium mb-2">Current Highest Bid</h3>
                {noBids ? (
                  <p className="text-slate-500 italic">No bids yet!</p>
                ) : highestBidder ? (
                  <div className="flex items-center space-x-4">
                    <img
                      src={highestBidder.photo}
                      alt={highestBidder.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-green-100"
                    />
                    <div>
                      <p className="text-slate-800 font-medium">
                        {highestBidder.name}
                      </p>
                      <p className="text-green-600 font-bold text-xl">
                        Rs {highestPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No bids yet</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-4">
                {/* Status messages */}
                <div className="text-center">
                  {isOwner && (
                    <div className="text-amber-600 bg-amber-50 p-2 rounded-lg font-medium mb-2">
                      You are the seller of this item
                    </div>
                  )}
                  {highestBidder?.id === Number(userId) && !isDisabled && (
                    <div className="text-green-600 bg-green-50 p-2 rounded-lg font-medium mb-2">
                      You are currently the highest bidder!
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-4">
                  {/* Place Bid button */}
                  <button
                    className={`flex-1 py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-sm 
                    ${isOwner || highestBidder?.id === Number(userId) || isDisabled
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200"
                    }`}
                    onClick={handlePlaceBid}
                    disabled={isOwner || highestBidder?.id === Number(userId) || isDisabled}
                  >
                    <FaHandHoldingUsd />
                    <span>Place Bid</span>
                  </button>
                  
                  {/* Buy Item button (for winners) */}
                  {isWinner && item.status !== "SOLD" && (
                    <button
                      onClick={handleClick}
                      className="flex-1 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 shadow-sm shadow-green-200"
                    >
                      <FaShoppingCart />
                      <span>Complete Purchase</span>
                    </button>
                  )}
                  
                  {/* Contact Seller button */}
                  {(!isWinner || item.status === "SOLD") && (
                    <button
                      className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2 shadow-sm"
                      onClick={() => setShowContactModal(true)}
                    >
                      <FaEnvelope />
                      <span>Contact Seller</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Seller Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 relative transform transition-all duration-300 ease-in-out">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <FaTimes className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              Contact Seller
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Enter your message to the seller..."
                  className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {contactError && (
                <div className="flex items-center space-x-2 text-red-500 text-sm p-2 bg-red-50 rounded-lg">
                  <FaExclamationCircle />
                  <p>{contactError}</p>
                </div>
              )}

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleContactSeller}
                  disabled={isSending}
                  className={`flex-1 py-3 rounded-lg transition ${
                    isSending
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                >
                  {isSending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ItemDetails;