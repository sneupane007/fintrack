import React from "react";
import ReactDOM from "react-dom/client";
import Expenses from "./components/create/Expenses";
import Dashboard from "./components/dashboard/Dashboard";
import Income from "./components/create/Income";
import App from "./App";
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <div className="flex flex-row bg-gray-500 text-center p-4">
      <Dashboard />
      <div className="flex flex-col bg-gray-500 text-center p-4">
        <Expenses />
        <Income />
      </div>
    </div>
    <div className="flex flex-col bg-gray-500 text-center p-4">
      <div />
      <App />
    </div>
  </React.StrictMode>
);
