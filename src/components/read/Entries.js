import React, { useState, useEffect } from "react";
import { deleteDoc, doc, collection, getDocs } from "firebase/firestore";
import EditComponent from "./EditComponent";
import { db } from "../../config/firebase";

function Entries({ entries }) {
  const [editingId, setEditingId] = useState(null); // Track which expense is being edited
  const [expenseList, setExpenseList] = useState([]);

  const getExpenses = async () => {
    const expenseCollection = collection(db, "expense");
    try {
      const data = await getDocs(expenseCollection);
      const filteredData = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenseList(filteredData);
      console.log("Fetched expenses: ", filteredData);
    } catch (error) {
      console.error("Error fetching expenses: ", error);
    }
  };

  useEffect(() => {
    getExpenses();
  }, []);

  const renderItems = () => {
    return expenseList.map((expense) => (
      <tr
        key={expense.id}
        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <td>{expense.amount}</td>
        <td>{expense.description}</td>
        <td>{expense.category}</td>
        <td>{expense.date}</td>
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
    ));
  };

  // Delete an expense
  const deleteExpense = async (id) => {
    try {
      await deleteDoc(doc(db, "expense", id));
      await getExpenses(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting expense: ", error);
    }
  };

  // Handle edit button click
  const handleEditButton = (id) => {
    setEditingId(id); // Set the ID of the expense being edited
    console.log("Editing expense with ID", id);
  };

  // Close the edit component
  const closeEditComponent = async () => {
    setEditingId(null); // Reset the editing ID
    await getExpenses(); // Refresh the list after editing
    console.log("Closed edit component");
  };

  return (
    <div>
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
        <tbody>{renderItems()}</tbody>
      </table>
    </div>
  );
}

export default Entries;
