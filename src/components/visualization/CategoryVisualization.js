import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CategoryVisualization = () => {
  const [incomeData, setIncomeData] = useState({});
  const [expenseData, setExpenseData] = useState({});

  useEffect(() => {
    // Set up real-time listener for income
    const unsubscribeIncome = onSnapshot(
      collection(db, "income"),
      (snapshot) => {
        const categoryTotals = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const category = data.category || "Uncategorized";
          categoryTotals[category] =
            (categoryTotals[category] || 0) + (data.amount || 0);
        });
        setIncomeData(categoryTotals);
      }
    );

    // Set up real-time listener for expenses
    const unsubscribeExpenses = onSnapshot(
      collection(db, "expense"),
      (snapshot) => {
        const categoryTotals = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const category = data.category || "Uncategorized";
          categoryTotals[category] =
            (categoryTotals[category] || 0) + (data.amount || 0);
        });
        setExpenseData(categoryTotals);
      }
    );

    return () => {
      unsubscribeIncome();
      unsubscribeExpenses();
    };
  }, []);

  const incomeChartData = {
    labels: Object.keys(incomeData),
    datasets: [
      {
        label: "Income by Category",
        data: Object.values(incomeData),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const expenseChartData = {
    labels: Object.keys(expenseData),
    datasets: [
      {
        label: "Expenses by Category",
        data: Object.values(expenseData),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
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
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value);
          },
        },
      },
    },
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Category Analysis
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">
            Income Categories
          </h3>
          <Bar data={incomeChartData} options={options} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-red-800 mb-4">
            Expense Categories
          </h3>
          <Bar data={expenseChartData} options={options} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">
            Income Details
          </h3>
          <div className="space-y-4">
            {Object.entries(incomeData).map(([category, amount]) => (
              <div
                key={category}
                className="flex justify-between items-center p-3 bg-blue-50 rounded"
              >
                <span className="font-medium">{category}</span>
                <span className="font-bold text-blue-600">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-red-800 mb-4">
            Expense Details
          </h3>
          <div className="space-y-4">
            {Object.entries(expenseData).map(([category, amount]) => (
              <div
                key={category}
                className="flex justify-between items-center p-3 bg-red-50 rounded"
              >
                <span className="font-medium">{category}</span>
                <span className="font-bold text-red-600">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryVisualization;
