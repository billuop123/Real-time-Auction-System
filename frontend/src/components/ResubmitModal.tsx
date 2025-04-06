import React, { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface ResubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDeadline: Date) => void;
  itemName: string;
}

export const ResubmitModal: React.FC<ResubmitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}) => {
  const [newDeadline, setNewDeadline] = useState<Date>(new Date());

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Set the time to current time
    const currentTime = new Date();
    newDeadline.setHours(currentTime.getHours());
    newDeadline.setMinutes(currentTime.getMinutes());
    newDeadline.setSeconds(currentTime.getSeconds());
    onConfirm(newDeadline);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <FaExclamationTriangle className="text-amber-500 text-2xl mr-3" />
          <h3 className="text-xl font-semibold text-gray-800">Resubmit Item</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Are you sure you want to resubmit "{itemName}" for approval? This will send it back to the admin for review.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Deadline
          </label>
          <DatePicker
            selected={newDeadline}
            onChange={(date: Date) => setNewDeadline(date)}
            minDate={new Date()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            dateFormat="MMMM d, yyyy"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition"
          >
            Resubmit
          </button>
        </div>
      </div>
    </div>
  );
}; 