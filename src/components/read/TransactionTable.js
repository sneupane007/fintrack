import React, { useState, useEffect } from "react";
import {
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import EditComponent from "./EditComponent";

export default function TransactionTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filter, setFilter] = useState("this-month"); // Default filter
  const { getUserCollection, user } = useAuth();

  const getDateRange = (filterType) => {
    const now = new Date();
    const startDate = new Date();

    switch (filterType) {
      case "this-month":
        startDate.setDate(1); // First day of current month
        break;
      case "last-month":
        startDate.setMonth(now.getMonth() - 1);
        startDate.setDate(1);
        now.setDate(0); // Last day of previous month
        break;
      case "last-three-months":
        startDate.setMonth(now.getMonth() - 3);
        startDate.setDate(1);
        break;
      case "all-time":
        startDate.setFullYear(2000); // Far enough in the past
        break;
      default:
        startDate.setDate(1); // Default to this month
    }

    return {
      start: startDate.toISOString().split("T")[0],
      end:
        filterType === "last-month"
          ? now.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
    };
  };

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const incomeCollection = getUserCollection("income");
    const expenseCollection = getUserCollection("expense");

    if (!incomeCollection || !expenseCollection) {
      setLoading(false);
      return;
    }

    const dateRange = getDateRange(filter);

    // Set up queries with date filter
    const incomeQuery = query(
      incomeCollection,
      where("date", ">=", dateRange.start),
      where("date", "<=", dateRange.end),
      orderBy("date", "desc")
    );

    const expenseQuery = query(
      expenseCollection,
      where("date", ">=", dateRange.start),
      where("date", "<=", dateRange.end),
      orderBy("date", "desc")
    );

    // Set up listeners
    const unsubIncome = onSnapshot(incomeQuery, (snapshot) => {
      const incomeData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "income",
      }));

      const unsubExpense = onSnapshot(expenseQuery, (snapshot) => {
        const expenseData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "expense",
        }));

        // Combine and sort transactions
        const allTransactions = [...incomeData, ...expenseData].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setTransactions(allTransactions);
        setLoading(false);
      });

      return () => {
        unsubIncome();
        unsubExpense();
      };
    });
  }, [getUserCollection, filter, user]);

  const handleDelete = async (id, type) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        const collection = getUserCollection(type);
        if (!collection) {
          throw new Error("User not authenticated");
        }
        await deleteDoc(doc(collection, id));
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Failed to delete transaction. Please try again.");
      }
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

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">
          Please sign in to view your transactions
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Transaction History
      </h2>

      <div className="flex justify-end mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="last-three-months">Last 3 Months</option>
          <option value="all-time">All Time</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
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
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className={`${
                    transaction.type === "income"
                      ? "bg-green-50 hover:bg-green-100"
                      : "bg-red-50 hover:bg-red-100"
                  } transition-colors duration-150`}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(transaction.id, transaction.type)
                      }
                      className="text-red-600 hover:text-red-900 transition-colors duration-150"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingTransaction && (
        <EditComponent
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onUpdate={() => {
            // The table will automatically update due to the real-time listener
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
}
