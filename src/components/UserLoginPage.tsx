import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";

/**
 * UserLoginPage - Professional Firebase Authentication Login Component
 * 
 * Features:
 * - Email/password authentication via Firebase
 * - Real-time form validation
 * - Password visibility toggle
 * - Remember me functionality
 * - Comprehensive error handling
 * - Loading states and user feedback
 * - Auto-redirect for authenticated users
 */
const UserLoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Monitor authentication state changes
   * Auto-redirect if user is already logged in
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setIsAuthenticated(true);
        // Store user token for compatibility with existing system
        user.getIdToken().then((token) => {
          sessionStorage.setItem("userToken", token);
          sessionStorage.setItem("userEmail", user.email || "");
          sessionStorage.setItem("userId", user.uid);
        });
        navigate("/user/availability");
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /**
   * Validate email format
   */
  const validateEmail = (emailValue: string): boolean => {
    return emailRegex.test(emailValue.trim());
  };

  /**
   * Validate password strength
   */
  const validatePassword = (passwordValue: string): boolean => {
    return passwordValue.length >= 6;
  };

  /**
   * Clear all error and success messages
   */
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Client-side validation
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!trimmedPassword) {
      setError("Password is required.");
      return;
    }

    if (!validatePassword(trimmedPassword)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        trimmedPassword
      );

      const user = userCredential.user;

      // Get and store authentication token
      const token = await user.getIdToken();
      sessionStorage.setItem("userToken", token);
      sessionStorage.setItem("userEmail", user.email || "");
      sessionStorage.setItem("userId", user.uid);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("savedEmail", trimmedEmail);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("savedEmail");
      }

      setSuccess("Login successful! Redirecting...");
      
      // Navigate after a brief delay for user feedback
      setTimeout(() => {
        navigate("/user/availability");
      }, 500);

    } catch (err: any) {
      setLoading(false);
      
      // Handle specific Firebase authentication errors
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email address.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address format.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled. Please contact support.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed login attempts. Please try again later.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;
        case "auth/invalid-credential":
          setError("Invalid email or password. Please check your credentials.");
          break;
        default:
          setError(err.message || "An error occurred during login. Please try again.");
      }
    }
  };

  /**
   * Load saved email if remember me was checked previously
   */
  useEffect(() => {
    const savedRememberMe = localStorage.getItem("rememberMe");
    const savedEmail = localStorage.getItem("savedEmail");
    
    if (savedRememberMe === "true" && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Don't render if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <section className="user-auth fade-up">
      <div className="container user-auth__grid">
        <div className="user-auth__panel">
          <div className="user-auth__header">
            <p className="pill">User Secure Login</p>
            <h2>User Login</h2>
            <p className="modules__subtitle">
              Access the blood availability and donor services with your secure account.
            </p>
          </div>

          <form className="user-auth__form" onSubmit={handleSubmit}>
            {/* Email Field */}
            <label className="user-auth__field">
              <span>Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearMessages();
                }}
                placeholder="Enter your email address"
                required
                autoComplete="email"
                disabled={loading}
                aria-label="Email address"
              />
            </label>

            {/* Password Field */}
            <label className="user-auth__field">
              <span>Password</span>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearMessages();
                  }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  aria-label="Password"
                  style={{ paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--gray-700)",
                    cursor: loading ? "not-allowed" : "pointer",
                    padding: "0.25rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {/* Remember Me & Forgot Password */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "1rem"
            }}>
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.875rem"
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  style={{ cursor: loading ? "not-allowed" : "pointer" }}
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="form-error" 
                role="alert"
                style={{ 
                  marginBottom: "1rem",
                  padding: "0.75rem",
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecdd3",
                  borderRadius: "0.5rem",
                  color: "#b91c1c"
                }}
              >
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div 
                className="form-success" 
                role="alert"
                style={{ 
                  marginBottom: "1rem",
                  padding: "0.75rem",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "0.5rem",
                  color: "#166534"
                }}
              >
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button 
              className="btn btn-primary user-auth__btn" 
              type="submit" 
              disabled={loading}
              style={{ 
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>Signing in...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Registration Link */}
            <div style={{ 
              textAlign: "center", 
              marginTop: "1.5rem",
              fontSize: "0.875rem",
              color: "var(--gray-700)"
            }}>
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/user/donor-registration")}
                  disabled={loading}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--red-600)",
                    cursor: loading ? "not-allowed" : "pointer",
                    textDecoration: "underline",
                    fontWeight: 600,
                    padding: 0
                  }}
                >
                  Register as Donor
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Hero Section */}
        <div className="user-auth__hero" aria-hidden>
          <div className="user-auth__hero-card">
            <div className="user-auth__hero-icon" />
            <div className="user-auth__hero-glow" />
            <h3>Secure Access</h3>
            <p>Your health data is protected with industry-standard encryption and authentication.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserLoginPage;
