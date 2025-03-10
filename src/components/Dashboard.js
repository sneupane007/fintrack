import React, { useState } from "react";
import { db } from "../config/firebase";
import {
  addDoc,
  getDocs,
  collection,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Dashboard() {
  // Initialize state to store the list of expenses from the database
  const [expenseList, setExpenseList] = useState([]);

  const expenseCollection = collection(db, "expense");
  const getExpenses = async () => {
    try {
      const data = await getDocs(expenseCollection);
      console.log("Data");
      const filteredData = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenseList(filteredData);
    } catch (error) {
      console.log(error);
    }
  };

  getExpenses();
  // Delete the expense from the database
  const deleteExpense = async (id) => {
    const expenseDoc = await deleteDoc(doc(db, "expense", id));
  };

  return (
    <div>
      <h1 className="p-4 bg-red-500 text-xl">Dashboard</h1>
      {expenseList.length > 0 ? (
        expenseList.map((expense) => (
          <div key={expense.id} className="p-4 border-b">
            <p>Amount: ${expense.Amount}</p>
            <p>Description: {expense.description}</p>
            <p>Date: {String(expense.Date)}</p>
            <button
              className="bg-red-500 text-white p-2 rounded-lg"
              onClick={() => deleteExpense(expense.id)}
            >
              Delete Entry
            </button>

            <button className="bg-blue-500 text-white p-2 rounded-lg">
              Edit Entry
            </button>
          </div>
        ))
      ) : (
        <p>No expenses found.</p>
      )}
    </div>
  );
}
