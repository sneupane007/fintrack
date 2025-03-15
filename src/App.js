import React, { useState } from "react";
import Expenses from "./components/Expenses";
import Dashboard from "./components/Dashboard";

export default function App() {
    const [expenseList, setExpenseList] = useState([]);
  
    return (
      <>
        <Expenses setExpenseList={setExpenseList} />
        <Dashboard expenseList={expenseList} setExpenseList={setExpenseList} />
      </>
    );
  }