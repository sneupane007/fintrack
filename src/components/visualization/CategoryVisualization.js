import React, { useState, useEffect } from "react";
import {
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { Link } from "react-router-dom";
import { FaCog } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

// Add a custom plugin to draw the dashed limit boxes
const limitBoxPlugin = {
  id: "limitBox",
  beforeDraw: (chart) => {
    const {
      ctx,
      scales: { x, y },
      data,
    } = chart;
    const limits = data.datasets[0].data; // Limits dataset
    const expenses = data.datasets[1].data; // Expenses dataset
    const barWidth = x.getPixelForValue(1) - x.getPixelForValue(0);

    ctx.save();
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    limits.forEach((limit, i) => {
      if (limit > 0) {
        const xPos = x.getPixelForValue(i) - barWidth * 0.4;
        const yPos = y.getPixelForValue(limit);
        const boxWidth = barWidth * 0.8;
        const boxHeight = y.getPixelForValue(0) - yPos;

        // Draw dashed box
        ctx.beginPath();
        ctx.moveTo(xPos, yPos);
        ctx.lineTo(xPos + boxWidth, yPos);
        ctx.lineTo(xPos + boxWidth, yPos + boxHeight);
        ctx.lineTo(xPos, yPos + boxHeight);
        ctx.lineTo(xPos, yPos);
        ctx.stroke();
      }
    });
    ctx.restore();
  },
};

// Create a pattern for the limit bars
const createPattern = (color) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = 10;
  canvas.width = size;
  canvas.height = size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, size);
  ctx.stroke();

  return ctx.createPattern(canvas, "repeat");
};

const CategoryVisualization = () => {
  const [incomeData, setIncomeData] = useState({});
  const [expenseData, setExpenseData] = useState({});
  const [categoryLimits, setCategoryLimits] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("this-month");
  const { getUserCollection, user } = useAuth();

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
    if (!user) {
      setIncomeData({});
      setExpenseData({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const incomeCollection = getUserCollection("income");
    const expenseCollection = getUserCollection("expense");
    const settingsCollection = getUserCollection("settings");

    if (!incomeCollection || !expenseCollection || !settingsCollection) {
      setLoading(false);
      return;
    }

    // Set up real-time listener for income
    const unsubscribeIncome = onSnapshot(incomeCollection, (snapshot) => {
      const categoryTotals = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const category = data.category || "Uncategorized";
        categoryTotals[category] =
          (categoryTotals[category] || 0) + (data.amount || 0);
      });
      setIncomeData(categoryTotals);
      setLoading(false);
    });

    // Fetch category limits
    const fetchLimits = async () => {
      try {
        const limitsDoc = await getDoc(
          doc(settingsCollection, "categoryLimits")
        );
        if (limitsDoc.exists()) {
          setCategoryLimits(limitsDoc.data());
        }
      } catch (error) {
        console.error("Error fetching category limits:", error);
      }
    };

    fetchLimits();

    // Fetch expenses
    const dateRange = getDateRange(filter);
    const expenseQuery = query(
      expenseCollection,
      where("date", ">=", dateRange.start),
      where("date", "<=", dateRange.end),
      orderBy("date", "desc")
    );

    const unsubExpense = onSnapshot(expenseQuery, (snapshot) => {
      const categoryTotals = {};

      snapshot.docs.forEach((doc) => {
        const { amount, category } = doc.data();
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      });

      setExpenseData(categoryTotals);
      setLoading(false);
    });

    return () => {
      unsubscribeIncome();
      unsubExpense();
    };
  }, [getUserCollection, user, filter]);

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
        label: "Category Limits",
        data: Object.keys(expenseData).map(
          (category) => categoryLimits[category] || 0
        ),
        backgroundColor: (context) => {
          const pattern = createPattern("rgba(255, 0, 0, 0.3)");
          return pattern;
        },
        borderColor: "rgba(255, 0, 0, 0.5)",
        borderWidth: 1,
        borderDash: [5, 5],
        type: "bar",
        order: 2,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
      {
        label: "Expenses",
        data: Object.values(expenseData),
        backgroundColor: (context) => {
          const value = context.raw;
          const categoryName = context.chart.data.labels[context.dataIndex];
          const limit = categoryLimits[categoryName] || 0;

          if (limit === 0) return "rgba(239, 68, 68, 0.8)";
          const ratio = value / limit;

          if (ratio >= 1) return "rgba(220, 38, 38, 0.8)"; // Red for over limit
          if (ratio >= 0.8) return "rgba(251, 146, 60, 0.8)"; // Orange for near limit
          return "rgba(239, 68, 68, 0.8)"; // Default red
        },
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
        type: "bar",
        order: 1,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
    ],
  };

  // --- Options for Income Chart ---
  const incomeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top", // Default legend for income
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const formattedValue = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value);
            return `${context.dataset.label}: ${formattedValue}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value);
          },
          font: {
            size: 11,
          },
          padding: 8,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
  };

  // --- Options for Expense Chart (includes limit display) ---
  const expenseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          generateLabels: () => [
            {
              text: "Expenses",
              fillStyle: "rgba(239, 68, 68, 0.8)",
              strokeStyle: "rgba(239, 68, 68, 1)",
              lineWidth: 1,
              hidden: false,
            },
            {
              text: "Category Limits",
              fillStyle: createPattern("rgba(255, 0, 0, 0.3)"),
              strokeStyle: "rgba(255, 0, 0, 0.5)",
              lineWidth: 1,
              lineDash: [5, 5],
              hidden: false,
            },
          ],
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.dataset.label !== "Expenses") return null;

            const value = context.raw;
            const category = context.label;
            const limit = categoryLimits[category] || 0;
            const remaining = limit - value;
            const percentUsed = limit > 0 ? (value / limit) * 100 : 0;

            const formattedValue = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value);

            const formattedLimit = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(limit);

            const formattedRemaining = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(Math.abs(remaining));

            return [
              `Spent: ${formattedValue}`,
              `Limit: ${formattedLimit}`,
              remaining >= 0
                ? `Remaining: ${formattedRemaining}`
                : `Over budget by: ${formattedRemaining}`,
              `${percentUsed.toFixed(1)}% of limit used`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: false,
        grid: {
          drawBorder: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value);
          },
          font: {
            size: 11,
          },
          padding: 8,
        },
      },
      x: {
        stacked: false,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">
          Please sign in to view category analysis
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
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Category Analysis</h2>
        <div className="flex items-center space-x-4">
          <Link
            to="/category-limits"
            className="text-blue-600 hover:text-blue-700 transition-colors"
            title="Set Category Limits"
          >
            <FaCog className="w-5 h-5" />
          </Link>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">
            Income Categories
          </h3>
          <div className="h-[400px]">
            {Object.keys(incomeData).length > 0 ? (
              <Chart
                type="bar"
                data={incomeChartData}
                options={incomeOptions}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">
                No income data available
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-red-800 mb-4">
            Expense Categories
          </h3>
          <div className="h-[400px]">
            {Object.keys(expenseData).length > 0 ? (
              <Chart
                type="bar"
                data={expenseChartData}
                options={expenseOptions}
              />
            ) : (
              <p className="text-gray-500 text-center py-8">
                No expense data available
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">
            Income Details
          </h3>
          <div className="space-y-4">
            {Object.entries(incomeData).length > 0 ? (
              Object.entries(incomeData).map(([category, amount]) => (
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
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No income data available
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-red-800 mb-4">
            Expense Details
          </h3>
          <div className="space-y-4">
            {Object.entries(expenseData).length > 0 ? (
              Object.entries(expenseData).map(([category, amount]) => (
                <div
                  key={category}
                  className="flex justify-between items-center p-3 bg-red-50 rounded"
                >
                  <span className="font-medium">{category}</span>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-red-600">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(amount)}
                    </span>
                    {categoryLimits[category] > 0 && (
                      <span className="text-sm text-gray-600">
                        Limit:{" "}
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(categoryLimits[category])}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No expense data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryVisualization;
