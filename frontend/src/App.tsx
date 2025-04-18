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
import AdminUsers from './pages/AdminUsers';
import AdminUserDetails from './pages/AdminUserDetails';
import { AdminRoute } from './components/AdminRoute';
import ResetPasswordEmail from "./pages/ResetPasswordEmail";
import ResetPassword from "./pages/ResetPassword";
const Home = lazy(() => import("./pages/Home"));
const ItemDetails = lazy(() => import("./pages/ItemDetails"));
const SigninPage = lazy(() => import("./pages/Signin"));
const SignupPage = lazy(() => import("./pages/Signup"));
const Userprofile = lazy(() => import("./pages/UserProfile"));
const AuctionItem = lazy(() => import("./pages/AuctionItem"));
const AdminSignin = lazy(() => import("./pages/AdminSignin"));
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
                <Route path="verifyemail" element={<VerifyEmail/>}/>
                <Route path="resendverificationemail" element={<ResendVerificationEmail/>}/>
                <Route path="/admin/signin" element={<AdminSignin />} />
                <Route path="/reset-password" element={<ResetPasswordEmail/>}/>
                <Route path="/resetpassword" element={<ResetPassword/>}/>
                {/* Protected Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                } />
                {/* <Route path="/admin/users/:userId" element={
                  <AdminRoute>
                    <AdminUserDetails />
                  </AdminRoute>
                } /> */}
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
