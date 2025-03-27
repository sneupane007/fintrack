import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { Pie } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseIncomeChart = () => {
  const [expenseCount, setExpenseCount] = useState(0);
  const [incomeCount, setIncomeCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expenseSnapshot = await getDocs(collection(db, "expense"));
        const incomeSnapshot = await getDocs(collection(db, "income"));

        setExpenseCount(expenseSnapshot.size);
        setIncomeCount(incomeSnapshot.size);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const data = {
    labels: ["Expense", "Income"],
    datasets: [
      {
        data: [expenseCount, incomeCount],
        backgroundColor: ["#FF6384", "#36A2EB"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: "400px", margin: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
        Finacial History
      </h2>
      <Pie data={data} />
    </div>
  );
};

export default ExpenseIncomeChart;
