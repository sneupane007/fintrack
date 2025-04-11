import React from "react";
import { addDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { currTime } from "../util/Time";

export default function Income() {
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const { getUserCollection } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!amount || amount <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }

    if (!description.trim()) {
      newErrors.description = "Please enter a description";
    }

    if (!category) {
      newErrors.category = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addToDB = async () => {
    if (!validateForm()) return;

    try {
      const incomeCollection = getUserCollection("income");
      if (!incomeCollection) {
        throw new Error("User not authenticated");
      }

      await addDoc(incomeCollection, {
        amount: Number(amount),
        description: description.trim(),
        category: category,
        date: currTime(),
      });
      setAmount("");
      setDescription("");
      setCategory("");
      setErrors({});
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Add Income</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.amount ? "border-red-500" : "border-gray-300"
            }`}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            type="text"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a Category</option>
            <option value="salary">Salary/Paycheck</option>
            <option value="freelance">Freelance Work</option>
            <option value="investments">Investments & Capital Gains</option>
            <option value="gifts">Gifts & Donations</option>
            <option value="rental">Rental Income</option>
            <option value="side_hustle">Side Hustle</option>
            <option value="refunds">Refunds & Rebates</option>
            <option value="other">Other Income</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>
        <button
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={addToDB}
        >
          Add Income
        </button>
      </div>
    </div>
  );
}
