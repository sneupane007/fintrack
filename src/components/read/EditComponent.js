import React, { useState } from "react";
import { db } from "../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { currTime } from "../util/Time";

function EditComponent({ id, initialData, onClose }) {
  const [amount, setAmount] = useState(initialData.amount);
  const [description, setDescription] = useState(initialData.description);
  const [category, setCategory] = useState(initialData.category);

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, initialData.type, id);
      await updateDoc(docRef, {
        amount: Number(amount),
        description: description,
        category: category,
        date: currTime(),
      });
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit Transaction
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a Category</option>
              {initialData.type === "income" ? (
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
                initialData.type === "income"
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
