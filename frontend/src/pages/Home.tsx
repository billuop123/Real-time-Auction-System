import { ItemCard } from "@/components/ItemCard";
import Navbar from "@/components/Navigation";
import { useSearch } from "@/Contexts/SearchItemContext";
import { getItems } from "@/helperFunctions/apiCalls";
import { useEffect, useState } from "react";
import { FaBoxOpen } from "react-icons/fa";
export const Home = function () {
  const [isLoading, setIsLoading] = useState(false);
  const { items: allItems, setItems } = useSearch();

  const sortedItems = allItems
    .filter((item) => new Date(item.deadline) > new Date()) // Active items only
    .sort((a, b) => {
      // Calculate time remaining for each item
      const timeRemainingA =
        new Date(a.deadline).getTime() - new Date().getTime();
      const timeRemainingB =
        new Date(b.deadline).getTime() - new Date().getTime();

      // Sort by least time remaining first
      return timeRemainingA - timeRemainingB;
    });

  // Append expired items at the end, sorted by how long they've been expired
  const expiredItems = allItems
    .filter((item) => new Date(item.deadline) <= new Date())
    .sort((a, b) => {
      const timeExpiredA =
        new Date().getTime() - new Date(a.deadline).getTime();
      const timeExpiredB =
        new Date().getTime() - new Date(b.deadline).getTime();

      return timeExpiredA - timeExpiredB;
    });

  // Combine active and expired items
  const finalSortedItems = [...sortedItems, ...expiredItems];

  // Fetch items from the API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const response = await getItems();

        setItems(response.data.allItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [setItems]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 md:mb-0">
            Discover Exciting Auctions
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
          </div>
        ) : finalSortedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {finalSortedItems.map((item) => (
              <ItemCard
                key={item.id}
                deadline={item.deadline}
                startingPrice={item.startingPrice}
                name={item.name}
                description={item.description}
                id={item.id}
                photo={item.photo}
                userId={item.userId}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-xl border border-gray-100">
            <FaBoxOpen className="text-7xl text-blue-200 mb-6" />
            <p className="text-2xl font-semibold text-gray-800 mb-2">
              No Auctions Available
            </p>
            <p className="text-base text-gray-500 text-center max-w-md">
              Looks like there are no active auctions right now. Check back soon
              or be the first to start an auction!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
