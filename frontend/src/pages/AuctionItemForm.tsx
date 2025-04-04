import { useInfo } from "@/hooks/loggedinUser";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import { Value } from "react-date-picker/dist/cjs/shared/types";

import {
  FaAlignLeft,
  FaCalendarAlt,
  FaDollarSign,
  FaExclamationCircle,
  FaImage,
  FaTag,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface AuctionItemFormProps {
  onSubmit: (formData: AuctionItemFormState) => void;
}

interface AuctionItemFormState {
  name: string;
  description: string;
  photo: File | null;
  deadline: Date | null;
  startingPrice: number;
  selectedCategory: string;
}

const AuctionItemForm: React.FC<AuctionItemFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<AuctionItemFormState>({
    name: "",
    description: "",
    photo: null,
    deadline: null,
    startingPrice: 0,
    selectedCategory: "",
  });

  const categories = [
    "ELECTRONICS",
    "VEHICLES",
    "FASHION",
    "ART",
    "SPORTS",
    "BOOKS",
    "TOYS",
    "TOOLS",
    "OTHERS",
  ];

  const handleCategoryChange = (e: any) => {
    const selectedValue = e.target.value;
    setFormData((prev) => ({
      ...prev,
      selectedCategory: selectedValue,
    }));
  };
  const userId = useInfo();
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
const navigate=useNavigate()
  useEffect(() => {
    const errors: { [key: string]: string } = {};
    const now = new Date();

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Item name is required";
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    // Photo validation
    if (!formData.photo) {
      errors.photo = "Please upload an item photo";
    }

    // Deadline validation
    if (!formData.deadline) {
      errors.deadline = "Auction deadline is required";
    } else if (formData.deadline <= now) {
      errors.deadline = "Deadline must be in the future";
    }

    // Price validation
    if (formData.startingPrice <= 0) {
      errors.startingPrice = "Starting price must be greater than 0";
    }

    setValidationErrors(errors);
    setIsSubmitDisabled(Object.keys(errors).length > 0);
  }, [formData]);

  // Image preview
  useEffect(() => {
    if (formData.photo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(formData.photo);
    } else {
      setPreview(null);
    }
  }, [formData.photo]);
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "startingPrice" ? (value ? parseFloat(value) : 0) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const handleDateChange = (value: Value) => {
    // Assuming `value` can be a single date or a range
    if (value instanceof Date) {
      const now = new Date();
      value.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      setFormData((prev) => ({ ...prev, deadline: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    }
  };
 
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
          Create Auction Item
        </h2>

        {/* Photo Upload with Preview */}
        <div className="mb-6">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition">
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaImage className="text-4xl text-slate-400 mb-3" />
                  <p className="mb-2 text-sm text-slate-500">
                    Click to upload image
                  </p>
                </div>
              )}
            </label>
          </div>
          {validationErrors.photo && (
            <p className="text-red-500 text-sm mt-2">
              {validationErrors.photo}
            </p>
          )}
        </div>

        {/* Category Select */}
        <div>
          <div className="w-full">
            <label
              htmlFor="category-select"
              className="block text-slate-700 text-sm font-medium mb-2"
            >
              Select Category
            </label>
            <select
              id="category-select"
              value={formData.selectedCategory}
              onChange={handleCategoryChange}
              className="block w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg 
              focus:ring-amber-500 focus:border-amber-500 p-2.5"
            >
              <option value="" disabled>
                Choose a category
              </option>
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-white text-slate-900"
                >
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FaTag className="text-amber-500" />
              <label className="text-sm font-medium text-slate-700">
                Item Name
              </label>
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                validationErrors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-200 focus:ring-amber-500"
              }`}
              placeholder="Enter item name"
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FaAlignLeft className="text-amber-500" />
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Describe your item"
            />
          </div>

          {/* Deadline */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FaCalendarAlt className="text-amber-500" />
              <label className="text-sm font-medium text-slate-700">
                Auction Deadline
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt
                  className={`text-lg ${
                    validationErrors.deadline
                      ? "text-red-500"
                      : "text-amber-500"
                  }`}
                />
              </div>
              <DatePicker
                value={formData.deadline}
                onChange={handleDateChange}
                minDate={new Date()}
                clearIcon={null}
                calendarIcon={null}
                format="y-MM-dd"
                className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 text-slate-700 ${
                  validationErrors.deadline
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-200 focus:ring-amber-500"
                }`}
                dayPlaceholder="dd"
                monthPlaceholder="mm"
                yearPlaceholder="yyyy"
                aria-label="Select auction deadline"
                aria-invalid={!!validationErrors.deadline}
                aria-errormessage="deadline-error"
              />
              {validationErrors.deadline && (
                <div
                  id="deadline-error"
                  className="absolute right-0 top-full mt-1 text-xs text-red-500 flex items-center"
                >
                  <FaExclamationCircle className="mr-1" />
                </div>
              )}
            </div>
            {validationErrors.deadline && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.deadline}
              </p>
            )}
          </div>

          {/* Starting Price */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FaDollarSign className="text-amber-500" />
              <label className="text-sm font-medium text-slate-700">
                Starting Price
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                name="startingPrice"
                value={formData.startingPrice || ""}
                onChange={handleChange}
                className={`w-full p-3 pl-7 border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.startingPrice
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-200 focus:ring-amber-500"
                }`}
                placeholder="Enter starting price"
                min="0"
                step="0.01"
              />
            </div>
            {validationErrors.startingPrice && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.startingPrice}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`w-full py-3 rounded-lg text-white font-semibold transition duration-300 ${
              isSubmitDisabled
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 hover:shadow-lg"
            }`}
          >
            Create Auction Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuctionItemForm;
