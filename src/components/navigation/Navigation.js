import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import {
  FaBell,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

function Navigation() {
  const { user, logout } = useAuth();
  const { limitExceeded, notifications, markAsRead, dismissAll } =
    useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification) => {
    if (notification.type === "welcome") {
      markAsRead(notification.id);
    } else if (notification.type === "limit") {
      markAsRead(notification.id);
      navigate("/category-limits");
      setShowNotifications(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "welcome":
        return <FaCheck className="w-5 h-5 text-green-500" />;
      case "limit":
        return <FaExclamationTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <FaCheck className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "welcome":
        return "bg-green-50 border-green-100";
      case "limit":
        return "bg-red-50 border-red-100";
      default:
        return "bg-blue-50 border-blue-100";
    }
  };

  return (
    <nav className="bg-white shadow-lg relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                FinTrack
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/categories"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Categories
                </Link>
                <Link
                  to="/reports"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Reports
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Notifications"
                >
                  <FaBell
                    className={limitExceeded ? "text-red-500" : "text-gray-400"}
                    size={20}
                  />
                  {limitExceeded && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                  )}
                </button>

                {showNotifications && notifications.length > 0 && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-200 overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Notifications
                      </h3>
                      <div className="flex items-center space-x-2 text-xs">
                        <button
                          onClick={() =>
                            setShowAllNotifications(!showAllNotifications)
                          }
                          className="text-gray-600 hover:text-gray-800"
                        >
                          {showAllNotifications ? "Show unread" : "Show all"}
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={dismissAll}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications
                        .filter((notification) =>
                          showAllNotifications ? true : !notification.read
                        )
                        .map((notification) => (
                          <div
                            key={notification.id}
                            className={`border-b border-gray-100 last:border-b-0 ${
                              notification.read ? "opacity-75" : "opacity-100"
                            }`}
                          >
                            <div
                              className={`flex p-4 cursor-pointer hover:bg-gray-50 transition duration-150 ${getNotificationColor(
                                notification.type
                              )} ${notification.read ? "bg-opacity-50" : ""}`}
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                            >
                              <div className="flex-shrink-0 mr-3">
                                {getNotificationIcon(notification.type)}
                                {notification.read && (
                                  <div className="mt-1 text-xs text-gray-500 font-medium">
                                    Read
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                {notification.type === "welcome" ? (
                                  <>
                                    <h4 className="text-sm font-semibold text-gray-800">
                                      {notification.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {notification.message}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <h4 className="text-sm font-semibold text-gray-800">
                                      Limit Exceeded: {notification.category}
                                    </h4>
                                    <div className="flex justify-between mt-1">
                                      <p className="text-xs text-gray-600">
                                        Spent ${notification.amount.toFixed(2)}{" "}
                                        of ${notification.limit.toFixed(2)}
                                      </p>
                                      <span className="text-xs font-bold text-red-600">
                                        {notification.percentage}% of limit
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                      <div
                                        className="bg-red-600 h-1.5 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            100,
                                            notification.percentage
                                          )}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(notification.date).toLocaleString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                {!notification.read && (
                                  <button
                                    className="text-gray-400 hover:text-gray-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    aria-label="Mark as read"
                                  >
                                    <FaCheck size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                      {notifications.filter((n) =>
                        showAllNotifications ? true : !n.read
                      ).length === 0 && (
                        <div className="px-4 py-6 text-center text-gray-500">
                          <p>
                            No {showAllNotifications ? "" : "unread"}{" "}
                            notifications
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-center p-2 bg-gray-50 border-t border-gray-200">
                      <Link
                        to="/category-limits"
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() => setShowNotifications(false)}
                      >
                        Manage Category Limits
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
