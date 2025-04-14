import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  generateFinancialReport,
  generateTrendChart,
} from "../../utils/pdfGenerator";
import { FaDownload, FaSpinner, FaFilePdf, FaChartLine } from "react-icons/fa";

const FinancialReports = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentMonthData, setCurrentMonthData] = useState({
    income: {},
    expenses: {},
    categoryLimits: {},
  });
  const [previousMonthData, setPreviousMonthData] = useState({
    income: {},
    expenses: {},
  });
  const { user, getUserCollection } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      const incomeCollection = getUserCollection("income");
      const expenseCollection = getUserCollection("expense");
      const settingsCollection = getUserCollection("settings");

      if (!incomeCollection || !expenseCollection || !settingsCollection) {
        setLoading(false);
        return;
      }

      // Get current month range
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(); // today

      // Get previous month range
      const previousMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Format dates for Firestore queries
      const currentMonthStartStr = currentMonthStart
        .toISOString()
        .split("T")[0];
      const currentMonthEndStr = currentMonthEnd.toISOString().split("T")[0];
      const prevMonthStartStr = previousMonthStart.toISOString().split("T")[0];
      const prevMonthEndStr = previousMonthEnd.toISOString().split("T")[0];

      // Fetch category limits
      try {
        const limitsDoc = await getDoc(
          doc(settingsCollection, "categoryLimits")
        );
        if (limitsDoc.exists()) {
          setCurrentMonthData((prev) => ({
            ...prev,
            categoryLimits: limitsDoc.data(),
          }));
        }
      } catch (error) {
        console.error("Error fetching category limits:", error);
      }

      // Fetch current month's income
      const currentIncomeQuery = query(
        incomeCollection,
        where("date", ">=", currentMonthStartStr),
        where("date", "<=", currentMonthEndStr),
        orderBy("date", "desc")
      );

      // Fetch current month's expenses
      const currentExpenseQuery = query(
        expenseCollection,
        where("date", ">=", currentMonthStartStr),
        where("date", "<=", currentMonthEndStr),
        orderBy("date", "desc")
      );

      // Fetch previous month's income
      const prevIncomeQuery = query(
        incomeCollection,
        where("date", ">=", prevMonthStartStr),
        where("date", "<=", prevMonthEndStr),
        orderBy("date", "desc")
      );

      // Fetch previous month's expenses
      const prevExpenseQuery = query(
        expenseCollection,
        where("date", ">=", prevMonthStartStr),
        where("date", "<=", prevMonthEndStr),
        orderBy("date", "desc")
      );

      // Setup listeners
      const unsubscribeCurrentIncome = onSnapshot(
        currentIncomeQuery,
        (snapshot) => {
          const categoryTotals = {};
          snapshot.docs.forEach((doc) => {
            const { amount, category } = doc.data();
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
          });

          setCurrentMonthData((prev) => ({
            ...prev,
            income: categoryTotals,
          }));
        }
      );

      const unsubscribeCurrentExpense = onSnapshot(
        currentExpenseQuery,
        (snapshot) => {
          const categoryTotals = {};
          snapshot.docs.forEach((doc) => {
            const { amount, category } = doc.data();
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
          });

          setCurrentMonthData((prev) => ({
            ...prev,
            expenses: categoryTotals,
          }));
        }
      );

      const unsubscribePrevIncome = onSnapshot(prevIncomeQuery, (snapshot) => {
        const categoryTotals = {};
        snapshot.docs.forEach((doc) => {
          const { amount, category } = doc.data();
          categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        });

        setPreviousMonthData((prev) => ({
          ...prev,
          income: categoryTotals,
        }));
      });

      const unsubscribePrevExpense = onSnapshot(
        prevExpenseQuery,
        (snapshot) => {
          const categoryTotals = {};
          snapshot.docs.forEach((doc) => {
            const { amount, category } = doc.data();
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
          });

          setPreviousMonthData((prev) => ({
            ...prev,
            expenses: categoryTotals,
          }));

          setLoading(false);
        }
      );

      return () => {
        unsubscribeCurrentIncome();
        unsubscribeCurrentExpense();
        unsubscribePrevIncome();
        unsubscribePrevExpense();
      };
    };

    fetchData();
  }, [user, getUserCollection]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? "New" : "0%";
    const changePercent = ((current - previous) / previous) * 100;
    const sign = changePercent > 0 ? "+" : "";
    return `${sign}${changePercent.toFixed(1)}%`;
  };

  const calculateTotal = (data) => {
    return Object.values(data).reduce((sum, amount) => sum + amount, 0);
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      // Current month and previous month for the report
      const now = new Date();
      const currentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();
      const previousMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      ).toISOString();

      // Create report data object
      const reportData = {
        incomeData: currentMonthData.income,
        expenseData: currentMonthData.expenses,
        categoryLimits: currentMonthData.categoryLimits,
        previousMonthIncome: previousMonthData.income,
        previousMonthExpense: previousMonthData.expenses,
        currentMonth,
        previousMonth,
        userName: user?.displayName || "",
      };

      // Generate the PDF report
      const doc = await generateFinancialReport(reportData);

      // Generate trend chart image
      const chartImage = await generateTrendChart(
        currentMonthData.income,
        currentMonthData.expenses,
        previousMonthData.income,
        previousMonthData.expenses
      );

      // Add chart to the PDF
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(52, 73, 94);
      doc.text("Income vs Expenses Trend", pageWidth / 2, 20, {
        align: "center",
      });

      // Add the chart image
      const imgWidth = 180;
      const imgHeight = 90;
      doc.addImage(
        chartImage,
        "PNG",
        (pageWidth - imgWidth) / 2,
        30,
        imgWidth,
        imgHeight
      );

      // Save and download the PDF
      const fileName = `financial_report_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("There was an error generating your report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">
          Please sign in to view financial reports
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

  const currentTotalIncome = calculateTotal(currentMonthData.income);
  const currentTotalExpense = calculateTotal(currentMonthData.expenses);
  const previousTotalIncome = calculateTotal(previousMonthData.income);
  const previousTotalExpense = calculateTotal(previousMonthData.expenses);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FaFilePdf />
              <span>Generate PDF Report</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary Card */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Monthly Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="font-medium">Total Income</span>
              <div className="text-right">
                <div className="font-bold text-blue-600">
                  {formatCurrency(currentTotalIncome)}
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <span
                    className={`mr-1 ${
                      currentTotalIncome > previousTotalIncome
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {calculateChange(currentTotalIncome, previousTotalIncome)}
                  </span>
                  vs previous month
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
              <span className="font-medium">Total Expenses</span>
              <div className="text-right">
                <div className="font-bold text-red-600">
                  {formatCurrency(currentTotalExpense)}
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <span
                    className={`mr-1 ${
                      currentTotalExpense < previousTotalExpense
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {calculateChange(currentTotalExpense, previousTotalExpense)}
                  </span>
                  vs previous month
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
              <span className="font-semibold">Net Balance</span>
              <div className="font-bold text-gray-800">
                {formatCurrency(currentTotalIncome - currentTotalExpense)}
              </div>
            </div>
          </div>
        </div>

        {/* Trend Chart Preview */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <FaChartLine className="mr-2 text-gray-500" />
            Monthly Trend
          </h3>
          <div className="h-32 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-500">Previous Month</div>
                <div className="h-20 w-full flex items-end space-x-2">
                  <div
                    className="bg-blue-400 rounded-t-md w-1/2"
                    style={{
                      height: `${
                        (previousTotalIncome /
                          Math.max(
                            previousTotalIncome,
                            previousTotalExpense,
                            1
                          )) *
                        100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-red-400 rounded-t-md w-1/2"
                    style={{
                      height: `${
                        (previousTotalExpense /
                          Math.max(
                            previousTotalIncome,
                            previousTotalExpense,
                            1
                          )) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-500">Current Month</div>
                <div className="h-20 w-full flex items-end space-x-2">
                  <div
                    className="bg-blue-600 rounded-t-md w-1/2"
                    style={{
                      height: `${
                        (currentTotalIncome /
                          Math.max(
                            currentTotalIncome,
                            currentTotalExpense,
                            1
                          )) *
                        100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-red-600 rounded-t-md w-1/2"
                    style={{
                      height: `${
                        (currentTotalExpense /
                          Math.max(
                            currentTotalIncome,
                            currentTotalExpense,
                            1
                          )) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-sm mr-1"></div>
                <span>Income</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded-sm mr-1"></div>
                <span>Expenses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Preview Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Data */}
        <div>
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            Income Categories
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(currentMonthData.income).length > 0 ? (
                  Object.entries(currentMonthData.income).map(
                    ([category, amount]) => (
                      <tr key={`income-${category}`}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {category}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {formatCurrency(amount)}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              amount > (previousMonthData.income[category] || 0)
                                ? "bg-green-100 text-green-800"
                                : amount <
                                  (previousMonthData.income[category] || 0)
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {calculateChange(
                              amount,
                              previousMonthData.income[category] || 0
                            )}
                          </span>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-4 text-sm text-center text-gray-500"
                    >
                      No income data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Data */}
        <div>
          <h3 className="text-lg font-semibold text-red-800 mb-3">
            Expense Categories
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Limit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(currentMonthData.expenses).length > 0 ? (
                  Object.entries(currentMonthData.expenses).map(
                    ([category, amount]) => {
                      const limit =
                        currentMonthData.categoryLimits[category] || 0;
                      const isOverLimit = limit > 0 && amount > limit;

                      return (
                        <tr
                          key={`expense-${category}`}
                          className={isOverLimit ? "bg-red-50" : ""}
                        >
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {category}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">
                            {formatCurrency(amount)}
                          </td>
                          <td className="px-4 py-2 text-sm text-right">
                            {limit > 0 ? (
                              <div>
                                <div
                                  className={`font-medium ${
                                    isOverLimit
                                      ? "text-red-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {formatCurrency(limit)}
                                </div>
                                {isOverLimit && (
                                  <div className="text-xs text-red-600">
                                    Over by {formatCurrency(amount - limit)}
                                  </div>
                                )}
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      isOverLimit
                                        ? "bg-red-600"
                                        : "bg-green-600"
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (amount / limit) * 100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">
                                No limit
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-4 text-sm text-center text-gray-500"
                    >
                      No expense data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          About Financial Reports
        </h3>
        <p className="text-sm text-gray-600">
          Your PDF report will include detailed information about your current
          month's finances, including income and expense breakdowns by category,
          comparison with the previous month, and visualization of your spending
          trends. Any expense categories that have exceeded their limits will be
          highlighted.
        </p>
        <div className="mt-3 text-sm text-gray-500">
          <div className="flex items-center">
            <FaDownload className="text-gray-400 mr-2" />
            <span>
              Reports are generated as PDF files and will download
              automatically.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
