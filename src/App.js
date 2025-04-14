import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Expenses from "./components/create/Expenses";
import Dashboard from "./components/dashboard/Dashboard";
import Income from "./components/create/Income";
import TransactionTable from "./components/read/TransactionTable";
import Navigation from "./components/navigation/Navigation";
import CategoryVisualization from "./components/visualization/CategoryVisualization";
import Login from "./components/auth/Login";
import TransactionPieChart from "./components/visualization/TransactionPieChart";
import CategoryLimits from "./components/settings/CategoryLimits";
import FinancialReports from "./components/reports/FinancialReports";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Financial Overview (spans 2 columns) */}
                  <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
                    <Dashboard />
                  </div>

                  {/* Right Column - Income and Expense Forms */}
                  <div className="lg:col-span-1">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-white rounded-lg shadow-lg p-4">
                        <h2 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">
                          Add Income
                        </h2>
                        <Income />
                      </div>
                      <div className="bg-white rounded-lg shadow-lg p-4">
                        <h2 className="text-lg font-semibold mb-3 text-red-600 border-b pb-2">
                          Add Expense
                        </h2>
                        <Expenses />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions Table - Full Width Below */}
                <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Recent Transactions
                  </h2>
                  {!user ? (
                    <div className="flex justify-center items-center h-64">
                      <p className="text-gray-500">
                        Please sign in to view your transactions
                      </p>
                    </div>
                  ) : (
                    <TransactionTable />
                  )}
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <CategoryVisualization />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/category-limits"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <CategoryLimits />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/overview"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <TransactionPieChart />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <FinancialReports />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
