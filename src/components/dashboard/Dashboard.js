import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { Pie } from "react-chartjs-2";
import { collection, onSnapshot } from "firebase/firestore";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseIncomeChart = () => {
  const [expenseCount, setExpenseCount] = useState(0);
  const [incomeCount, setIncomeCount] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    // Set up real-time listener for expenses
    const unsubscribeExpenses = onSnapshot(
      collection(db, "expense"),
      (snapshot) => {
        const count = snapshot.size;
        const total = snapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0
        );
        setExpenseCount(count);
        setTotalExpenses(total);
      }
    );

    // Set up real-time listener for income
    const unsubscribeIncome = onSnapshot(
      collection(db, "income"),
      (snapshot) => {
        const count = snapshot.size;
        const total = snapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0
        );
        setIncomeCount(count);
        setTotalIncome(total);
      }
    );

    // Cleanup function
    return () => {
      unsubscribeExpenses();
      unsubscribeIncome();
    };
  }, []);

  const data = {
    labels: ["Expenses", "Income"],
    datasets: [
      {
        data: [totalExpenses, totalIncome],
        backgroundColor: ["#FF6384", "#36A2EB"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom",
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
      },
    },
  };

  return (
    <div className="space-y-4">
      <div style={{ width: "400px", margin: "auto" }}>
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
          Financial Overview
        </h2>
        <Pie data={data} options={options} />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-800">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalExpenses)}
          </p>
          <p className="text-sm text-gray-600">{expenseCount} transactions</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800">Total Income</h3>
          <p className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalIncome)}
          </p>
          <p className="text-sm text-gray-600">{incomeCount} transactions</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseIncomeChart;
