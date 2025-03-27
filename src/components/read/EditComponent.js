import React, { useState } from "react";
import { db } from "../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { currTime } from "../util/Time";
function EditComponent({ id, initialData, onClose }) {
  const [amount, setAmount] = useState(initialData.Amount);
  const [description, setDescription] = useState(initialData.description);
  console.log("Updating expense...", id);
  // Update the expense in Firestore
  const handleUpdate = async () => {
    try {
      const expenseDoc = doc(db, "expense", id);
      await updateDoc(expenseDoc, {
        amount: amount,
        description: description,
        date: currTime(),
      });
      onClose(); // Close the edit component and refresh the list
    } catch (error) {
      console.error("Error updating expense: ", error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold">Edit Expense</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="p-2 border rounded-lg"
        placeholder="Amount"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-2 border rounded-lg"
        placeholder="Description"
      />
      <button
        className="bg-green-500 text-white p-2 rounded-lg"
        onClick={handleUpdate}
      >
        Save Changes
      </button>
      <button
        className="bg-gray-500 text-white p-2 rounded-lg"
        onClick={onClose}
      >
        Cancel
      </button>
    </div>
  );
}

export default EditComponent;
