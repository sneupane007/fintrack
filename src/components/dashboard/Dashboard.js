import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { onSnapshot, query, where, orderBy } from "firebase/firestore";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("this-month");
  const { getUserCollection } = useAuth();

  const getDateRange = (filterType) => {
    const now = new Date();
    const startDate = new Date();

    switch (filterType) {
      case "this-month":
        startDate.setDate(1);
        break;
      case "last-month":
        startDate.setMonth(now.getMonth() - 1);
        startDate.setDate(1);
        now.setDate(0);
        break;
      case "last-three-months":
        startDate.setMonth(now.getMonth() - 3);
        startDate.setDate(1);
        break;
      case "all-time":
        startDate.setFullYear(2000);
        break;
      default:
        startDate.setDate(1);
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
    const fetchData = async () => {
      setLoading(true);
      const incomeCollection = getUserCollection("income");
      const expenseCollection = getUserCollection("expense");

      if (!incomeCollection || !expenseCollection) {
        setLoading(false);
        return;
      }

      const dateRange = getDateRange(filter);

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

      const unsubIncome = onSnapshot(incomeQuery, (snapshot) => {
        const total = snapshot.docs.reduce(
          (sum, doc) => sum + doc.data().amount,
          0
        );
        setTotalIncome(total);
      });

      const unsubExpense = onSnapshot(expenseQuery, (snapshot) => {
        const total = snapshot.docs.reduce(
          (sum, doc) => sum + doc.data().amount,
          0
        );
        setTotalExpenses(total);
        setLoading(false);
      });

      return () => {
        unsubIncome();
        unsubExpense();
      };
    };

    fetchData();
  }, [getUserCollection, filter]);

  const chartData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [totalIncome, totalExpenses],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
        borderColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = totalIncome + totalExpenses;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Financial Overview</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-600 mb-4">
              Total Income
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalIncome)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-600 mb-4">
              Total Expenses
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalExpenses)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="w-full max-w-md mx-auto">
          <Pie data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
