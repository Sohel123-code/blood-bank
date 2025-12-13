import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../components/firebase";

/**
 * Authentication Context Interface
 * Provides authentication state and methods throughout the application
 */
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access authentication context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * AuthProvider Component
 * Manages authentication state and provides it to child components
 */
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setCurrentUser(user);
      
      if (user) {
        // Store user data in sessionStorage for compatibility
        try {
          const token = await user.getIdToken();
          sessionStorage.setItem("userToken", token);
          sessionStorage.setItem("userEmail", user.email || "");
          sessionStorage.setItem("userId", user.uid);
          sessionStorage.setItem("userDisplayName", user.displayName || "");
        } catch (error) {
          console.error("Error storing user token:", error);
        }
      } else {
        // Clear session storage on logout
        sessionStorage.removeItem("userToken");
        sessionStorage.removeItem("userEmail");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("userDisplayName");
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      // Clear all session and local storage
      sessionStorage.clear();
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("savedEmail");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  /**
   * Refresh and get the current user's ID token
   */
  const refreshToken = async (): Promise<string | null> => {
    if (!currentUser) return null;
    
    try {
      const token = await currentUser.getIdToken(true); // Force refresh
      sessionStorage.setItem("userToken", token);
      return token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    signOut,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
