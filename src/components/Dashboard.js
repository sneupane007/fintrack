import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import EditComponent from "./EditComponent";
import { deleteDoc, doc } from "firebase/firestore";
import { getExpenses } from "./Utils";

export default function Dashboard() {
  const [expenseList, setExpenseList] = useState([]); // Use state for expenseList
  const [editingId, setEditingId] = useState(null); // Track which expense is being edited

  useEffect(() => {
    const fetchExpenses = async () => {
      const expenses = await getExpenses();
      setExpenseList(expenses);
    };
    fetchExpenses();
  }, []); // Fetch expenses on component mount

  // Delete an expense
  const deleteExpense = async (id) => {
    try {
      await deleteDoc(doc(db, "expense", id));
      const updatedExpenses = await getExpenses(); // Refresh the list after deletion
      setExpenseList(updatedExpenses);
    } catch (error) {
      console.error("Error deleting expense: ", error);
    }
  };

  // Handle edit button click
  const handleEditButton = (id) => {
    setEditingId(id); // Set the ID of the expense being edited
  };

  // Close the edit component
  const closeEditComponent = async () => {
    setEditingId(null); // Reset the editing ID
    const updatedExpenses = await getExpenses(); // Refresh the list after editing
    setExpenseList(updatedExpenses);
  };

  return (
    <>
      <h1 className="text-xl">Dashboard</h1>
      <div
        className="container my-5"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <table className="w-full text-sm text-left rtl:text-right text-white-500 dark:text-gray-400">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Description</th>
              <th>Category</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenseList.length > 0 ? (
              expenseList.map((expense) => (
                <tr
                  key={expense.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td>{expense.amount}</td>
                  <td>{expense.description}</td>
                  <td>{expense.category}</td>
                  <td>{String(expense.date)}</td>
                  <td className="flex flex-row">
                    <button
                      className="bg-red-500 text-white rounded-lg"
                      onClick={() => deleteExpense(expense.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-blue-500 text-white rounded-lg"
                      onClick={() => handleEditButton(expense.id)}
                    >
                      Edit
                    </button>
                    {editingId === expense.id && (
                      <EditComponent
                        id={expense.id}
                        initialData={expense}
                        onClose={closeEditComponent}
                      />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No expenses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
