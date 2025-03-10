import React from "react";
import { db } from "../config/firebase";
import { addDoc, collection } from "firebase/firestore";

// handle the submission of expenses
export default function Expenses() {
  const [amount, setAmount] = React.useState(0);
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const addToDB = async () => {
    try {
      await addDoc(collection(db, "expense"), {
        Amount: amount,
        description: description,
        category: category,
        date: new Date(),
      });
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="p-6 bg-red-500">
      {/* Amount */}
      <input
        className="m-2 p-2 rounded-lg"
        type="number"
        placeholder="Amount"
        onChange={(e) => setAmount(e.target.value)}
      />
      {/* Description */}
      <input
        className="m-2 p-2 rounded-lg"
        type="text"
        placeholder="Description"
        onChange={(e) => setDescription(e.target.value)}
      />
      {/* Category Dropdown */}
      <select
        className="m-2 p-2 rounded-lg"
        name="myDropdown"
        placeholder="Category"
        onChange={(e) => setCategory(e.target.value)}
      >
        <option disabled hidden selected value="">
          Select a Category
        </option>

        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
      <label>Choose an option:</label>
      <button className="m-2 p-2 bg-teal-500 rounded-lg" onClick={addToDB}>
        Add to finance
      </button>
    </div>
  );
}
