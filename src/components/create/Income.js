import React from "react";
import { db } from "../../config/firebase";
import { addDoc, collection } from "firebase/firestore";
import { currTime } from "../util/Time";
import { getIncome } from "../util/Utils";
export default function Income() {
  const [amount, setAmount] = React.useState(0);
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState(null);

  const [incomeList, setIncomeList] = React.useState([]); // Use state for expenseList
  
    React.useEffect(() => {
      const fetchIncome = async () => {
        const income = await getIncome();
        setIncomeList(income);
      };
      fetchIncome();
    }, []);

  const addToDB = async () => {
    try {
      await addDoc(collection(db, "income"), {
        amount: Number(amount),
        description: description,
        category: category,
        date: currTime(),
      });
    } catch (err) {
      console.error(err);
    }
        const updatedIncome = await getIncome(); // Refresh the list after deletion
        setIncomeList(updatedIncome);
        console.log("Added to DB");
  };
  return (
    <div className="m-4 p-4 rounded-lg bg-gray-200">
      <h1 className="text-xl">Income</h1>
      {/* Amount */}
      <input
        className="m-2 p-2 rounded-lg"
        type="number"
        placeholder="Amount"
        onChange={(e) => setAmount(e.target.value)}
        required
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
        className="m-2 p-2 bg-blue-500 rounded-lg"
        name="myDropdown"
        placeholder="Category"
        onChange={(e) => setCategory(e.target.value)}
        required
      >
        <option defaultValue="">Select a Category</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
      <button className="m-2 p-2 bg-teal-500 rounded-lg" onClick={addToDB}>
        Add to finance
      </button>
    </div>
  );
}
