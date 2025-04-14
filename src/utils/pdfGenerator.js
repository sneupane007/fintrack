import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Chart } from "chart.js/auto";

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Get month name
const getMonthName = (date) => {
  return new Date(date).toLocaleString("default", { month: "long" });
};

// Generate PDF report
export const generateFinancialReport = async (data) => {
  const {
    incomeData,
    expenseData,
    categoryLimits,
    previousMonthIncome,
    previousMonthExpense,
    currentMonth,
    previousMonth,
    userName,
  } = data;

  // Calculate totals
  const totalIncome = Object.values(incomeData).reduce(
    (sum, amt) => sum + amt,
    0
  );
  const totalExpense = Object.values(expenseData).reduce(
    (sum, amt) => sum + amt,
    0
  );
  const previousTotalIncome = Object.values(previousMonthIncome).reduce(
    (sum, amt) => sum + amt,
    0
  );
  const previousTotalExpense = Object.values(previousMonthExpense).reduce(
    (sum, amt) => sum + amt,
    0
  );

  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 55; // Starting Y position for tables

  // Add title
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text("Financial Report", pageWidth / 2, 20, { align: "center" });

  // Add subtitle with month and year
  doc.setFontSize(12);
  doc.setTextColor(52, 73, 94);
  doc.text(
    `${getMonthName(currentMonth)}, ${new Date(currentMonth).getFullYear()}`,
    pageWidth / 2,
    28,
    { align: "center" }
  );

  // Add user name if available
  if (userName) {
    doc.setFontSize(10);
    doc.text(`Generated for: ${userName}`, pageWidth / 2, 35, {
      align: "center",
    });
  }

  // Add generation date
  doc.setFontSize(8);
  doc.setTextColor(127, 140, 141);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 40, {
    align: "center",
  });

  // Summary section
  doc.setFontSize(14);
  doc.setTextColor(52, 73, 94);
  doc.text("Monthly Summary", 14, 50);

  doc.setFontSize(10);
  doc.setTextColor(44, 62, 80);

  // Summary table
  const summaryData = [
    [
      "Total Income",
      formatCurrency(totalIncome),
      formatCurrency(previousTotalIncome),
      `${(
        ((totalIncome - previousTotalIncome) / (previousTotalIncome || 1)) *
        100
      ).toFixed(1)}%`,
    ],
    [
      "Total Expenses",
      formatCurrency(totalExpense),
      formatCurrency(previousTotalExpense),
      `${(
        ((totalExpense - previousTotalExpense) / (previousTotalExpense || 1)) *
        100
      ).toFixed(1)}%`,
    ],
    [
      "Net Balance",
      formatCurrency(totalIncome - totalExpense),
      formatCurrency(previousTotalIncome - previousTotalExpense),
      "",
    ],
  ];

  // Using autoTable directly instead of doc.autoTable
  autoTable(doc, {
    startY: yPos,
    head: [["Category", "Current Month", "Previous Month", "Change"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
    },
  });

  // Update yPos to be after the table
  yPos = doc.lastAutoTable.finalY + 15;

  // Income section
  doc.setFontSize(14);
  doc.setTextColor(52, 73, 94);
  doc.text("Income by Category", 14, yPos);

  // Prepare income data for table
  const incomeTableData = Object.entries(incomeData).map(
    ([category, amount]) => {
      const prevAmount = previousMonthIncome[category] || 0;
      const change =
        prevAmount === 0
          ? "New"
          : `${(((amount - prevAmount) / prevAmount) * 100).toFixed(1)}%`;

      return [
        category,
        formatCurrency(amount),
        formatCurrency(prevAmount),
        change,
      ];
    }
  );

  // Add income table
  autoTable(doc, {
    startY: yPos + 5,
    head: [["Category", "Amount", "Previous Month", "Change"]],
    body: incomeTableData,
    theme: "grid",
    headStyles: { fillColor: [52, 152, 219], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
    },
  });

  // Update yPos to be after the table
  yPos = doc.lastAutoTable.finalY + 15;

  // Expense section with limit tracking
  doc.setFontSize(14);
  doc.setTextColor(52, 73, 94);
  doc.text("Expenses by Category", 14, yPos);

  // Prepare expense data for table
  const expenseTableData = Object.entries(expenseData).map(
    ([category, amount]) => {
      const limit = categoryLimits[category] || 0;
      const prevAmount = previousMonthExpense[category] || 0;
      const isOverLimit = limit > 0 && amount > limit;

      const change =
        prevAmount === 0
          ? "New"
          : `${(((amount - prevAmount) / prevAmount) * 100).toFixed(1)}%`;

      const limitStatus =
        limit > 0
          ? isOverLimit
            ? `Over by ${formatCurrency(amount - limit)}`
            : `${((amount / limit) * 100).toFixed(0)}% of limit`
          : "No limit";

      return [
        category,
        formatCurrency(amount),
        formatCurrency(prevAmount),
        change,
        limitStatus,
      ];
    }
  );

  // Add expense table with limit column
  autoTable(doc, {
    startY: yPos + 5,
    head: [["Category", "Amount", "Previous Month", "Change", "Limit Status"]],
    body: expenseTableData,
    theme: "grid",
    headStyles: { fillColor: [231, 76, 60], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 30, halign: "right" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 20, halign: "right" },
      4: { cellWidth: 40 },
    },
    // Highlight rows with exceeded limits
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const category = expenseTableData[data.row.index][0];
        const amount = expenseData[category] || 0;
        const limit = categoryLimits[category] || 0;

        if (limit > 0 && amount > limit) {
          // Add red background to exceeded limit cells
          doc.setFillColor(255, 236, 236);
          doc.rect(
            data.cell.x,
            data.cell.y,
            data.cell.width,
            data.cell.height,
            "F"
          );
          doc.setTextColor(231, 76, 60);
          doc.text(
            data.cell.text,
            data.cell.x + data.cell.width / 2,
            data.cell.y + data.cell.height / 2,
            {
              align: "center",
              baseline: "middle",
            }
          );
          return true; // Returning true means we've handled the cell content
        }
      }
      return false; // Let the library handle other cells
    },
  });

  // Update yPos to be after the table
  yPos = doc.lastAutoTable.finalY + 15;

  // Add conclusion
  doc.setFontSize(12);
  doc.setTextColor(52, 73, 94);
  const netBalance = totalIncome - totalExpense;
  const status =
    netBalance >= 0
      ? `You saved ${formatCurrency(netBalance)} this month.`
      : `You spent ${formatCurrency(
          Math.abs(netBalance)
        )} more than you earned this month.`;

  doc.text("Summary:", 14, yPos);
  doc.setFontSize(10);
  doc.text(status, 14, yPos + 7);

  // Check if there were exceeded limits
  const exceededCategories = Object.entries(expenseData)
    .filter(([category, amount]) => {
      const limit = categoryLimits[category] || 0;
      return limit > 0 && amount > limit;
    })
    .map(([category]) => category);

  if (exceededCategories.length > 0) {
    doc.setTextColor(231, 76, 60);
    doc.text(
      `You exceeded your budget in ${exceededCategories.length} ${
        exceededCategories.length === 1 ? "category" : "categories"
      }: ${exceededCategories.join(", ")}.`,
      14,
      yPos + 14
    );
  }

  // Save PDF
  return doc;
};

// Generate chart image for trends
export const generateTrendChart = async (
  incomeData,
  expenseData,
  previousIncomeData,
  previousExpenseData
) => {
  // Create canvas element
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 300;
  document.body.appendChild(canvas);

  // Calculate totals
  const currentIncome = Object.values(incomeData).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const currentExpense = Object.values(expenseData).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const previousIncome = Object.values(previousIncomeData).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const previousExpense = Object.values(previousExpenseData).reduce(
    (sum, amount) => sum + amount,
    0
  );

  // Create chart
  new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Previous Month", "Current Month"],
      datasets: [
        {
          label: "Income",
          data: [previousIncome, currentIncome],
          backgroundColor: "rgba(52, 152, 219, 0.6)",
          borderColor: "rgba(52, 152, 219, 1)",
          borderWidth: 1,
        },
        {
          label: "Expenses",
          data: [previousExpense, currentExpense],
          backgroundColor: "rgba(231, 76, 60, 0.6)",
          borderColor: "rgba(231, 76, 60, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: "Income vs Expenses Trend",
        },
        legend: {
          position: "bottom",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
    },
  });

  // Convert to image and clean up
  const chartImage = canvas.toDataURL("image/png");
  document.body.removeChild(canvas);

  return chartImage;
};
