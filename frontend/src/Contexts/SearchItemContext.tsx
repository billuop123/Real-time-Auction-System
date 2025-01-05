import React, {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

// Define the type for the `Item` object
interface Item {
  id: string;
  deadline: string;
  startingPrice: number;
  name: string;
  description: string;
  photo: string;
  userId: string;
}

// Define the type for the context value
interface SearchContextType {
  items: Item[]; // Change from string[] to Item[]
  setItems: Dispatch<SetStateAction<Item[]>>; // Change from string[] to Item[]
}

// Create the context with the appropriate type or null
const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]); // Use Item[] instead of string[]

  // Provide both `items` and `setItems` as the context value
  return (
    <SearchContext.Provider value={{ items, setItems }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);

  // Handle the case where context is not provided
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }

  return context;
}
