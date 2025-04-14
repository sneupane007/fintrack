import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { currTime } from "../util/Time";

function EditComponent({ transaction, onClose, onUpdate }) {
  const [amount, setAmount] = useState(transaction.amount);
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState(transaction.category);
  const [error, setError] = useState("");
  const { getUserCollection } = useAuth();

  const handleUpdate = async () => {
    try {
      // Validate inputs
      if (!amount || amount <= 0) {
        setError("Please enter a valid amount");
        return;
      }
      if (!description.trim()) {
        setError("Please enter a description");
        return;
      }
      if (!category) {
        setError("Please select a category");
        return;
      }

      const collection = getUserCollection(transaction.type);
      if (!collection) {
        throw new Error("User not authenticated");
      }

      const docRef = doc(collection, transaction.id);
      await updateDoc(docRef, {
        amount: Number(amount),
        description: description.trim(),
        category: category,
        date: currTime(),
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
      setError("Failed to update transaction. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit{" "}
            {transaction.type.charAt(0).toUpperCase() +
              transaction.type.slice(1)}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Amount"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError("");
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setError("");
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a Category</option>
              {transaction.type === "income" ? (
                <>
                  <option value="salary">Salary/Paycheck</option>
                  <option value="freelance">Freelance Work</option>
                  <option value="investments">
                    Investments & Capital Gains
                  </option>
                  <option value="gifts">Gifts & Donations</option>
                  <option value="rental">Rental Income</option>
                  <option value="side_hustle">Side Hustle</option>
                  <option value="refunds">Refunds & Rebates</option>
                  <option value="other">Other Income</option>
                </>
              ) : (
                <>
                  <option value="housing">Housing & Rent</option>
                  <option value="utilities">Utilities</option>
                  <option value="groceries">Groceries</option>
                  <option value="dining">Dining Out</option>
                  <option value="transportation">Transportation</option>
                  <option value="health">Health & Medical</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="shopping">Shopping</option>
                  <option value="education">Education</option>
                  <option value="personal_care">Personal Care</option>
                  <option value="travel">Travel</option>
                  <option value="subscriptions">Subscriptions</option>
                  <option value="debt">Debt Payments</option>
                  <option value="savings">Savings & Investments</option>
                  <option value="other">Other Expenses</option>
                </>
              )}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                transaction.type === "income"
                  ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditComponent;
