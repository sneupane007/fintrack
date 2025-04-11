import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Expenses from "./components/create/Expenses";
import Dashboard from "./components/dashboard/Dashboard";
import Income from "./components/create/Income";
import TransactionTable from "./components/read/TransactionTable";
import Navigation from "./components/Navigation";
import CategoryVisualization from "./components/visualization/CategoryVisualization";
import Login from "./components/auth/Login";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppContent() {
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Dashboard */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <Dashboard />
                    </div>
                  </div>

                  {/* Right Column - Forms and Table */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Forms Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <Income />
                      </div>
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <Expenses />
                      </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Recent Transactions
                      </h2>
                      <TransactionTable />
                    </div>
                  </div>
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
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
