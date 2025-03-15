import React from "react";
import ReactDOM from "react-dom/client";
import Expenses from "./components/Expenses";
import Dashboard from "./components/Dashboard";
import Income from "./components/Income";
import App from "./App";
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <div className="flex flex-row bg-gray-500 text-center p-4">
      {/* <div className="w-1/2 border-x">
        <Dashboard />
      </div>
      <div>
        <Expenses />
        <Income />
      </div> */}
      <App/>
    </div>
  </React.StrictMode>
);
