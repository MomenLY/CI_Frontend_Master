// src/components/Modal.js
import React from 'react';

const Modal = ({ show, onClose, title, children, size }) => {
  if (!show) return null;
  let nameClass = "";
  (title == 'modalOne') ? nameClass = "bg-transparent" : nameClass = "bg-white";
  const handleBackgroundClick = (e) => {
    // Close the modal only if the click is outside the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div
    onClick={handleBackgroundClick} 
     className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center p-0 sm:p-[80px] lg:p-[100px] items-center">      
      <div className={`${nameClass} p-6 rounded-[12px] shadow-lg w-full md:min-h-[400px] ${size === "large" ? "max-w-full" : "max-w-[645px] md:max-w-[645px]"}`}>
        {/* <h2 className="text-xl font-bold mb-4">{title}</h2> */}
        <div>{children}</div>
        {/* <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button> */}
      </div>
    </div>
  );
};

export default Modal;
