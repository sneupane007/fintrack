import React from "react";
import ReactDOM from "react-dom/client";
import Expenses from "./components/Expenses";
import Dashboard from "./components/Dashboard";
import Income from "./components/Income";
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <div className="grid-cols-3 py-5 bg-gray-500 text-white text-center">
      <Dashboard />
      <Expenses />
      <Income />
    </div>
  </React.StrictMode>
);
