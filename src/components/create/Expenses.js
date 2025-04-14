import React, { useState } from "react";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

export default function Expenses() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const { getUserCollection } = useAuth();

  const validateForm = () => {
    if (!amount || !description || !category || !date) {
      setError("Please fill in all fields");
      return false;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    return true;
  };

  const addToDB = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const expenseCollection = getUserCollection("expense");
      if (!expenseCollection) {
        setError("Please sign in to add expense");
        return;
      }

      await addDoc(expenseCollection, {
        amount: parseFloat(amount),
        description,
        category,
        date: date,
        createdAt: serverTimestamp(),
        type: "expense",
      });

      // Reset form
      setAmount("");
      setDescription("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
      setError("");
    } catch (error) {
      setError("Error adding expense: " + error.message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Expense</h2>
      <form onSubmit={addToDB} className="space-y-4">
        <div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            step="0.01"
          />
        </div>
        <div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Housing">Housing</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}
