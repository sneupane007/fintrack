import { React, useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import EntryRow from "./EntryRow";

function ExpenseTable() {
  const [expenseList, setExpenseList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchExpenses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "expense"));
      const expenses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenseList(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "expense", id));
      fetchExpenses(); // Refresh the list
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleCloseEdit = () => {
    setEditingId(null);
    fetchExpenses(); // Refresh after editing
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenseList.map((expense) => (
            <EntryRow
              key={expense.id}
              expense={expense}
              isEditing={editingId === expense.id}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onCloseEdit={handleCloseEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseTable;
