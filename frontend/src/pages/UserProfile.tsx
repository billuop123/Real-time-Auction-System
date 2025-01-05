import {
  loggedIn,
  updateProfilePicture,
  userProfile,
} from "@/helperFunctions/apiCalls";
import { useInfo } from "@/hooks/loggedinUser";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaCamera, FaEnvelope, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const Userprofile = () => {
  const [photo, setPhoto] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const userId = useInfo();
  const navigate = useNavigate();

  useEffect(() => {
    async function isLoggedIn() {
      const jwt = sessionStorage.getItem("jwt");
      if (!jwt) navigate("/signin");
      const status = await loggedIn(jwt);
      if (!status) {
        navigate("/signin");
      }
      setIsLoggedIn(status);
    }
    isLoggedIn();
  }, [navigate]);
  useEffect(() => {
    if (!userId) return;

    async function fetchDetails() {
      try {
        setIsLoading(true);
        const response = await userProfile(userId);
        const { name, email, photo } = response.data.user;
        setName(name);
        setEmail(email);
        setPhoto(photo);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Optional: Add error toast or notification
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetails();
  }, [userId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    if (!userId) return;
    if (file) {
      const formData = new FormData();
      formData.append("profilePicture", file);
      formData.append("userId", userId);

      try {
        setIsLoading(true);
        const response = await updateProfilePicture(formData);
        setPhoto(response.data.photo);
        toast.success("Photo successfully updated!");
      } catch (error) {
        console.error("Error updating profile picture:", error);
        toast.error("Failed to update profile picture!");
        // Optional: Add error toast or notification
      } finally {
        setIsLoading(false);
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center">
          <div
            className="relative group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <img
              src={photo || "/default-avatar.png"}
              alt={`${name}'s profile`}
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-lg group-hover:opacity-70 transition-all duration-300"
            />
            {isHovering && (
              <div
                onClick={triggerFileInput}
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <FaCamera className="text-white text-2xl" />
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-4">{name}</h2>
          <p className="text-gray-500 text-sm">{email}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
            <FaUser className="text-blue-500 text-xl" />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-semibold text-gray-800">{name}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
            <FaEnvelope className="text-blue-500 text-xl" />
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-semibold text-gray-800">{email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Userprofile;
