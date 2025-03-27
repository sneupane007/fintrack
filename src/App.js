import React, { useState } from "react";
import Expenses from "./components/create/Expenses";
import Dashboard from "./components/dashboard/Dashboard";
import Entries from "./components/read/Entries";
import ExpenseTable from "./components/read/ExpenseTable";
export default function App() {
  const [expenseList, setExpenseList] = useState([]);

  return (
    <>
      <ExpenseTable />
    </>
  );
}
