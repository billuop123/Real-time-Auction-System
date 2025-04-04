import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./Contexts/AuthContext";

import { SearchProvider } from "./Contexts/SearchItemContext";
import { lazy, Suspense } from "react";
import { Spinner } from "./components/SpinnerFullPage";
import { Toaster } from "react-hot-toast";
import { UserItems } from "./components/UserItems";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ClerkProvider, SignIn } from '@clerk/clerk-react'
import { VerifyEmail } from "./pages/VerifyEmail";
import { ResendVerificationEmail } from "./pages/ResendVerificationEmail";
const Home = lazy(() => import("./pages/Home"));
const ItemDetails = lazy(() => import("./pages/ItemDetails"));
const SigninPage = lazy(() => import("./pages/Signin"));
const SignupPage = lazy(() => import("./pages/Signup"));
const Userprofile = lazy(() => import("./pages/UserProfile"));
const AuctionItem = lazy(() => import("./pages/AuctionItem"));
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}
function App() {
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
          <AuthProvider>
            <SearchProvider>
              <Routes>
                <Route index element={<Home />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="signin" element={<SigninPage />} />
                <Route path="add-item" element={<AuctionItem />} />
                <Route path="/:id" element={<ItemDetails />} />
                <Route path="/user/profile" element={<Userprofile />} />
                <Route path="/user/items" element={<UserItems />} />
                <Route path="/admin/admindashboard" element={<AdminDashboard/>}/>
                <Route path="verifyemail" element={<VerifyEmail/>}/>
                <Route path="resendverificationemail" element={<ResendVerificationEmail/>}/>
              </Routes>
            </SearchProvider>
          </AuthProvider>
          </ClerkProvider>
        </Suspense>
        <Toaster
          position="bottom-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
            style: {
              fontSize: "16px",
              maxWidth: "500px",
              padding: "16px 24px",
              backgroundColor: "var(--color-grey-0)",
              color: "var(--color-grey-700)",
            },
          }}
        />
      </BrowserRouter>
    </>
  );
}

export default App;
