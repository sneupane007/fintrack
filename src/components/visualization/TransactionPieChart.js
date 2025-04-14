import React, { useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const TransactionPieChart = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const { getUserCollection, user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTotalIncome(0);
      setTotalExpense(0);
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

    // Set up real-time listener for income
    const unsubscribeIncome = onSnapshot(incomeCollection, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        total += parseFloat(data.amount) || 0;
      });
      setTotalIncome(total);
      setLoading(false);
    });

    // Set up real-time listener for expenses
    const unsubscribeExpenses = onSnapshot(expenseCollection, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        total += parseFloat(data.amount) || 0;
      });
      setTotalExpense(total);
      setLoading(false);
    });

    return () => {
      unsubscribeIncome();
      unsubscribeExpenses();
    };
  }, [getUserCollection, user]);

  const data = {
    labels: ["income", "expenses"],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: ["rgba(54, 162, 235, 0.8)", "rgba(255, 99, 132, 0.8)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: "bold",
          },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const formattedValue = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value);
            return `${label}: ${formattedValue}`;
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 16,
          weight: "bold",
        },
        bodyFont: {
          size: 14,
        },
        padding: 10,
      },
    },
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">
          Please sign in to view transaction analysis
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

  const totalTransactions = totalIncome + totalExpense;
  const incomePercentage =
    totalTransactions > 0
      ? ((totalIncome / totalTransactions) * 100).toFixed(1)
      : 0;
  const expensePercentage =
    totalTransactions > 0
      ? ((totalExpense / totalTransactions) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Financial Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Income vs Expenses
          </h3>
          {totalTransactions > 0 ? (
            <div className="h-[400px] w-full flex items-center justify-center">
              <div className="w-full h-full relative">
                <Pie data={data} options={options} />
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-gray-500 text-center">
                No transaction data available
              </p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Transaction Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="font-medium">Total Income</span>
              <span className="font-bold text-blue-600">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(totalIncome)}
                <span className="text-sm text-gray-500 ml-2">
                  ({incomePercentage}%)
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="font-medium">Total Expenses</span>
              <span className="font-bold text-red-600">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(totalExpense)}
                <span className="text-sm text-gray-500 ml-2">
                  ({expensePercentage}%)
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Net Balance</span>
              <span
                className={`font-bold ${
                  totalIncome - totalExpense >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(totalIncome - totalExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPieChart;
