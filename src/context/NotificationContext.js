import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import {
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  collection,
  setDoc,
} from "firebase/firestore";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasWelcomeNotification, setHasWelcomeNotification] = useState(false);
  const { user, getUserCollection } = useAuth();

  // Check if user is new and show welcome notification
  useEffect(() => {
    if (!user) return;

    const checkNewUser = async () => {
      const settingsCollection = getUserCollection("settings");
      if (!settingsCollection) return;

      // Check if user has seen welcome notification
      const userPrefsDoc = doc(settingsCollection, "userPreferences");
      const userPrefs = await getDoc(userPrefsDoc);

      if (!userPrefs.exists() || !userPrefs.data().welcomeShown) {
        // Add welcome notification
        setNotifications((prevNotifications) => [
          {
            id: "welcome",
            type: "welcome",
            title: "Welcome to FinTrack!",
            message:
              "Thanks for joining us. Start by adding your income and expenses to track your finances.",
            date: new Date().toISOString(),
            read: false,
          },
          ...prevNotifications,
        ]);

        setHasWelcomeNotification(true);

        // Mark welcome notification as shown
        await setDoc(
          userPrefsDoc,
          {
            welcomeShown: true,
            welcomeDate: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    };

    checkNewUser();
  }, [user, getUserCollection]);

  // Monitor expense limits
  useEffect(() => {
    if (!user) {
      setLimitExceeded(false);
      if (!hasWelcomeNotification) {
        setNotifications([]);
      }
      return;
    }

    const settingsCollection = getUserCollection("settings");
    const expenseCollection = getUserCollection("expense");

    if (!settingsCollection || !expenseCollection) return;

    // Get the current month for filtering expenses
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDateString = startDate.toISOString().split("T")[0];
    const endDateString = new Date().toISOString().split("T")[0];

    // First get the category limits
    const limitsUnsubscribe = onSnapshot(
      doc(settingsCollection, "categoryLimits"),
      async (limitsDoc) => {
        if (!limitsDoc.exists()) return;

        const categoryLimits = limitsDoc.data();

        // Get current month's expenses
        const expenseQuery = query(
          expenseCollection,
          where("date", ">=", startDateString),
          where("date", "<=", endDateString)
        );

        const expenseSnapshot = await onSnapshot(expenseQuery, (snapshot) => {
          // Calculate totals per category
          const categoryTotals = {};

          snapshot.docs.forEach((doc) => {
            const { amount, category } = doc.data();
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
          });

          // Check for exceeded limits
          const exceededCategories = Object.entries(categoryTotals)
            .filter(([category, amount]) => {
              const limit = categoryLimits[category] || 0;
              return limit > 0 && amount > limit;
            })
            .map(([category, amount]) => ({
              id: `limit-${category}`,
              type: "limit",
              category,
              amount,
              limit: categoryLimits[category],
              percentage: Math.round((amount / categoryLimits[category]) * 100),
              date: new Date().toISOString(),
              read: false,
            }));

          setNotifications((prev) => {
            // Keep welcome notification if it exists
            const welcomeNotification = prev.find((n) => n.type === "welcome");
            const updatedNotifications = exceededCategories;

            if (welcomeNotification) {
              return [welcomeNotification, ...updatedNotifications];
            }

            return updatedNotifications;
          });

          setLimitExceeded(
            exceededCategories.length > 0 || hasWelcomeNotification
          );
        });

        return () => expenseSnapshot();
      }
    );

    return () => {
      limitsUnsubscribe();
    };
  }, [user, getUserCollection, hasWelcomeNotification]);

  // Mark a notification as read
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    // Don't remove welcome notification after it's read, just mark it as read
    if (notificationId === "welcome") {
      // We keep hasWelcomeNotification true to retain the notification
      // but mark it as read in the notifications array above
    }

    // Check if any unread notifications remain to manage the indicator
    const hasUnread = notifications.some(
      (n) => !n.read && n.id !== notificationId
    );
    if (!hasUnread) {
      setLimitExceeded(false);
    }
  };

  // Clear all notifications (only used for explicit user request)
  const dismissAll = () => {
    // Mark all as read instead of removing them
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setLimitExceeded(false);
  };

  const value = {
    limitExceeded,
    notifications,
    markAsRead,
    dismissAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
