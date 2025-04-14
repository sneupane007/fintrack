import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_CATEGORIES = [
  "Food",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Other",
];

function CategoryLimits() {
  const [limits, setLimits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { getUserCollection, user } = useAuth();

  useEffect(() => {
    const fetchLimits = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const limitsCollection = getUserCollection("settings");
        if (!limitsCollection) return;

        const limitsDoc = await getDoc(doc(limitsCollection, "categoryLimits"));
        if (limitsDoc.exists()) {
          setLimits(limitsDoc.data());
        } else {
          // Initialize default limits
          const defaultLimits = DEFAULT_CATEGORIES.reduce((acc, category) => {
            acc[category] = 0;
            return acc;
          }, {});
          setLimits(defaultLimits);
        }
      } catch (error) {
        console.error("Error fetching limits:", error);
        setError("Failed to load category limits");
      }
      setLoading(false);
    };

    fetchLimits();
  }, [user, getUserCollection]);

  const handleLimitChange = (category, value) => {
    setLimits((prev) => ({
      ...prev,
      [category]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const limitsCollection = getUserCollection("settings");
      if (!limitsCollection) {
        setError("Please sign in to save limits");
        return;
      }

      await setDoc(doc(limitsCollection, "categoryLimits"), limits);
      setSuccess("Category limits saved successfully!");
    } catch (error) {
      console.error("Error saving limits:", error);
      setError("Failed to save category limits");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Category Spending Limits
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {DEFAULT_CATEGORIES.map((category) => (
            <div key={category} className="flex items-center space-x-4">
              <label className="w-1/3 text-gray-700 font-medium">
                {category}
              </label>
              <div className="w-2/3">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={limits[category] || ""}
                    onChange={(e) =>
                      handleLimitChange(category, e.target.value)
                    }
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">USD</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Limits
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryLimits;
