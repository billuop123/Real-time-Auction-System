import React, { createContext, useContext, useState } from "react";

// Define the type for the context value
interface AuthContextType {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  isVerified: boolean | null;
  setIsVerified: React.Dispatch<React.SetStateAction<boolean | null>>;
}

// Create the context with the appropriate type or null
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  return (
    <AuthContext.Provider value={{ email, setEmail, password, setPassword, isVerified, setIsVerified }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  // Handle the case where context is not provided
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
