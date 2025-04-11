import React, { useState, useEffect } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import EditComponent from "./EditComponent";

export default function TransactionTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const { getUserCollection } = useAuth();

  const fetchTransactions = async () => {
    try {
      const incomeCollection = getUserCollection("income");
      const expenseCollection = getUserCollection("expense");

      if (!incomeCollection || !expenseCollection) {
        throw new Error("User not authenticated");
      }

      const [incomeSnapshot, expenseSnapshot] = await Promise.all([
        incomeCollection.get(),
        expenseCollection.get(),
      ]);

      const incomeData = incomeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "income",
      }));

      const expenseData = expenseSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "expense",
      }));

      const allTransactions = [...incomeData, ...expenseData].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [getUserCollection]);

  const handleDelete = async (id, type) => {
    try {
      const collection = getUserCollection(type);
      if (!collection) {
        throw new Error("User not authenticated");
      }
      await deleteDoc(doc(collection, id));
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className={
                transaction.type === "income" ? "bg-green-50" : "bg-red-50"
              }
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(transaction.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {transaction.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {transaction.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatAmount(transaction.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {transaction.type.charAt(0).toUpperCase() +
                  transaction.type.slice(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <button
                  onClick={() => setEditingTransaction(transaction)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(transaction.id, transaction.type)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingTransaction && (
        <EditComponent
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onUpdate={() => {
            setEditingTransaction(null);
            setLoading(true);
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}
