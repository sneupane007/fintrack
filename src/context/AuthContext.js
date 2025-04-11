import React, { createContext, useState, useEffect, useContext } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();

  // Configure Google provider
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });

  // Helper function to get user-specific collection reference
  const getUserCollection = (collectionName) => {
    if (!user) return null;
    return collection(db, `users/${user.uid}/${collectionName}`);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user document exists in Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (!userDoc.exists()) {
            // Create user document and initial collections if they don't exist
            await setDoc(doc(db, "users", user.uid), {
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: new Date().toISOString(),
            });

            // Create initial collections for the user
            await Promise.all([
              setDoc(doc(db, `users/${user.uid}/income`, "initial"), {}),
              setDoc(doc(db, `users/${user.uid}/expense`, "initial"), {}),
            ]);
          }
          setUser(user);
          setError(null);
        } catch (error) {
          console.error("Error setting up user document:", error);
          setError("Error setting up your account. Please try again.");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
    getUserCollection,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
