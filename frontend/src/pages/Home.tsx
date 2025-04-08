import { ItemCard } from "@/components/ItemCard";
import Navbar from "@/components/Navigation";
import { useSearch, Item } from "@/Contexts/SearchItemContext";
import { getItems } from "@/helperFunctions/apiCalls";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaBoxOpen, FaFire, FaClock, FaPlus, FaSort, FaStar, FaBell, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";

export const Home = function () {
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState("time-left");
  const [showFilters, setShowFilters] = useState(false);
  const { items: allItems, setItems } = useSearch();
  const [featuredItems,setFeaturedItems]=useState([]);
  // Categories for the website
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
  
  // Filter state
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    category: "",
    condition: ""
  });
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle filter application
  const applyFilters = () => {
    // This would typically trigger a fetch with the filters
    console.log("Applying filters:", filters);
    // For now we're just filtering client-side
  };
  
  // Handle category quick link click
  const handleCategoryClick = (categoryValue:any) => {
    setFilters(prev => ({ ...prev, category: categoryValue }));
    setShowFilters(true);
  };
  
  // Filter for approved items first
  const approvedItems = allItems.filter(item => {
    console.log("Checking approval status for item:", item.id, "Status:", item.approvalStatus);
    return item.approvalStatus === "APPROVED";
  });
  console.log("Approved items count:", approvedItems.length, "Items:", approvedItems);

  // Filter items that are either active or expired within 60 days
  const validItems = approvedItems.filter(item => {
    const deadline = new Date(item.deadline).getTime();
    const now = new Date().getTime();
    const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
    
    // Item is either active (deadline in future) or expired within 60 days
    const isActive = deadline > now;
    const isRecentlyExpired = deadline <= now && (now - deadline) <= sixtyDaysInMs;
    
    console.log("Item:", item.id, "Deadline:", new Date(deadline), "Is active:", isActive, "Is recently expired:", isRecentlyExpired);
    return isActive || isRecentlyExpired;
  });
  console.log("Valid items count:", validItems.length, "Items:", validItems);

  // Apply client-side filters
  const filteredItems = validItems.filter(item => {
    // Filter by price range
    if (filters.minPrice && item.startingPrice < parseFloat(filters.minPrice)) {
      console.log("Item filtered out by min price:", item.id);
      return false;
    }
    if (filters.maxPrice && item.startingPrice > parseFloat(filters.maxPrice)) {
      console.log("Item filtered out by max price:", item.id);
      return false;
    }
    
    // Filter by category
    if (filters.category && item.category !== filters.category.toUpperCase()) {
      console.log("Item filtered out by category:", item.id, "Item category:", item.category, "Filter category:", filters.category.toUpperCase());
      return false;
    }
    
    return true;
  });
  console.log("Final filtered items count:", filteredItems.length, "Items:", filteredItems);

  // Sort items based on selected option
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aTimeRemaining = new Date(a.deadline).getTime() - new Date().getTime();
    const bTimeRemaining = new Date(b.deadline).getTime() - new Date().getTime();
    
    // First, sort by whether the item is closed or not
    if (aTimeRemaining <= 0 && bTimeRemaining > 0) return 1; // Move closed items to end
    if (aTimeRemaining > 0 && bTimeRemaining <= 0) return -1; // Keep active items at start
    
    // Then apply the selected sorting option for items in the same category (both closed or both active)
    if (sortOption === "time-left") {
      return aTimeRemaining - bTimeRemaining;
    } else if (sortOption === "price-high") {
      return b.startingPrice - a.startingPrice;
    } else if (sortOption === "price-low") {
      return a.startingPrice - b.startingPrice;
    }
    return 0;
  });
  
  useEffect(()=>{
    const fetchFeaturedItems=async()=>{
      const response=await axios.get("http://localhost:3001/api/v1/item/featured");
      setFeaturedItems(response.data.featuredItems);
    }
    fetchFeaturedItems();
  },[])
 
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const response = await getItems();
        console.log("Raw items from API:", response.data.allItems);
        setItems(response.data.allItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItems();
  }, [setItems]);
  
  // Get expiring soon items (active items where deadline is within 24 hours)
  const expiringSoonItems = sortedItems.filter(
    item => {
      const timeRemaining = new Date(item.deadline).getTime() - new Date().getTime();
      return timeRemaining <= 24 * 60 * 60 * 1000 && // 24 hours in milliseconds
             timeRemaining > 0; // Only include items that haven't ended yet
    }
  );
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section with Modern Dark Background */}
      <div className="pt-20 pb-16 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
              <circle id="pattern-circle" cx="20" cy="20" r="3.5" fill="#6366F1" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Bid, Win, Celebrate on AuctionHub
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Discover exclusive deals on collectibles, luxury items, and unique finds that you won't find anywhere else.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
            <Link to="/add-item">
              <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-amber-500/30 transition duration-300 flex items-center">
                <FaPlus className="mr-2" />
                Start an Auction
              </button>
              </Link>
              {/* <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-slate-800/20 border border-slate-700 transition duration-300">
                Browse Categories
              </button> */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Quick Links - Updated with new categories */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-2">
            {categories.map((category, index) => (
              <button 
                key={category.value || `category-${index}`}
                className={`px-4 py-2 ${filters.category === category.value && index === 0 ? 'bg-amber-100 text-amber-800' : filters.category === category.value ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'} rounded-full whitespace-nowrap flex-shrink-0 hover:bg-slate-200 transition`}
                onClick={() => handleCategoryClick(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Featured Items Banner */}
        {featuredItems.length > 0 && (
          <div className="mb-12 overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-1">
            <div className="bg-slate-900 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <FaStar className="text-amber-500 mr-3" />
                <h2 className="text-2xl font-bold text-white">Featured Auctions</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredItems.map((item: Item) => (
                  <div key={`featured-${item.id}`} className="bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-amber-500/10 transition duration-300 border border-slate-700">
                    <div className="h-40 bg-slate-300 relative overflow-hidden">
                      {item.photo && (
                        <img 
                          src={item.photo} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Featured
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-medium mb-1 truncate">{item.name}</h3>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-500 font-bold">${item.startingPrice}</span>
                        <span className="text-slate-300 text-sm flex items-center">
                          <FaClock className="mr-1 text-xs" /> Ends Soon
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800 text-white text-sm font-medium">
              <FaClock className="mr-2" /> {sortedItems.length} Active Auctions
            </span>
            {expiringSoonItems.length > 0 && (
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium">
                <FaFire className="mr-2" /> {expiringSoonItems.length} Ending Soon
              </span>
            )}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 text-slate-800 text-sm font-medium hover:bg-slate-200 transition"
            >
              <FaFilter className="mr-2" /> Filters
            </button>
          </div>
          
          <div className="relative">
            <div className="flex items-center space-x-2">
              <FaSort className="text-slate-500" />
              <select 
                className="bg-white border border-slate-200 text-slate-700 py-2 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="time-left">Ending Soon</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="newest">Newest First</option>
               
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters Panel - Now with working functionality */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-8 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price Range</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min" 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" 
                  />
                  <span className="text-slate-500">-</span>
                  <input 
                    type="number" 
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max" 
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categories</label>
                <select 
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Condition</label>
                <select 
                  name="condition"
                  value={filters.condition}
                  onChange={handleFilterChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Any Condition</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button 
                onClick={applyFilters}
                className="bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-slate-700 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            {/* Newsletter/Alert Banner */}
            {/* <div className="mb-12 bg-slate-100 rounded-xl p-6 border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0 md:mr-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Never Miss an Auction</h3>
                  <p className="text-slate-600">Get notified when items you're watching are about to end or when new items match your interests.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-0"
                  />
                  <button className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-amber-400/20 transition flex items-center justify-center">
                    <FaBell className="mr-2" /> Alert Me
                  </button>
                </div>
              </div>
            </div> */}
            
            {expiringSoonItems.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 w-1 h-8 bg-amber-500 rounded-full mr-3"></div>
                  <h2 className="text-2xl font-bold text-slate-800">Ending Soon</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {expiringSoonItems.map((item) => (
                    <ItemCard
                      key={`expiring-${item.id}`}
                      deadline={item.deadline}
                      startingPrice={item.startingPrice}
                      name={item.name}
                      description={item.description}
                      id={item.id}
                      photo={item.photo}
                      userId={item.userId}
                      highlight={true}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 w-1 h-8 bg-slate-800 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-slate-800">All Auctions</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {sortedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    deadline={item.deadline}
                    startingPrice={item.startingPrice}
                    name={item.name}
                    description={item.description}
                    id={item.id}
                    photo={item.photo}
                    userId={item.userId}
                    highlight={false}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-lg border border-slate-200 transition-all hover:shadow-xl">
            <FaBoxOpen className="text-7xl text-amber-300 mb-6" />
            <p className="text-2xl font-semibold text-slate-800 mb-2">
              No Auctions Available
            </p>
            <p className="text-base text-slate-500 text-center max-w-md px-4">
        
            </p>
            <button className="mt-8 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              Start an Auction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;