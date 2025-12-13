import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, User } from "firebase/auth";
import { auth } from "./firebase";

/**
 * UserRegistrationPage - Professional Firebase User Registration Component
 * 
 * Features:
 * - Email/password registration via Firebase
 * - Real-time form validation with visual feedback
 * - Password strength indicator
 * - Password confirmation matching
 * - Comprehensive error handling
 * - Loading states and user feedback
 * - Auto-redirect after successful registration
 * - Terms and conditions acceptance
 */
const UserRegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // UI state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Calculate password strength
   */
  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    if (pwd.length === 0) return { strength: 0, label: "", color: "" };
    if (pwd.length < 6) return { strength: 1, label: "Weak", color: "#ef4444" };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength: 2, label: "Weak", color: "#ef4444" };
    if (strength === 3) return { strength: 3, label: "Fair", color: "#f59e0b" };
    if (strength === 4) return { strength: 4, label: "Good", color: "#3b82f6" };
    return { strength: 5, label: "Strong", color: "#10b981" };
  };

  const passwordStrength = getPasswordStrength(password);

  /**
   * Validate display name
   */
  const validateDisplayName = (name: string): string | undefined => {
    const trimmed = name.trim();
    if (!trimmed) return "Full name is required.";
    if (trimmed.length < 2) return "Name must be at least 2 characters.";
    if (trimmed.length > 50) return "Name must be less than 50 characters.";
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes.";
    }
    return undefined;
  };

  /**
   * Validate email format
   */
  const validateEmail = (emailValue: string): string | undefined => {
    const trimmed = emailValue.trim();
    if (!trimmed) return "Email address is required.";
    if (!emailRegex.test(trimmed)) return "Please enter a valid email address.";
    return undefined;
  };

  /**
   * Validate password
   */
  const validatePassword = (pwd: string): string | undefined => {
    if (!pwd) return "Password is required.";
    if (pwd.length < 6) return "Password must be at least 6 characters long.";
    if (pwd.length > 128) return "Password must be less than 128 characters.";
    return undefined;
  };

  /**
   * Validate password confirmation
   */
  const validateConfirmPassword = (confirm: string, original: string): string | undefined => {
    if (!confirm) return "Please confirm your password.";
    if (confirm !== original) return "Passwords do not match.";
    return undefined;
  };

  /**
   * Real-time validation
   */
  useEffect(() => {
    const errors: typeof validationErrors = {};
    
    if (displayName) {
      const nameError = validateDisplayName(displayName);
      if (nameError) errors.displayName = nameError;
    }
    
    if (email) {
      const emailError = validateEmail(email);
      if (emailError) errors.email = emailError;
    }
    
    if (password) {
      const pwdError = validatePassword(password);
      if (pwdError) errors.password = pwdError;
    }
    
    if (confirmPassword) {
      const confirmError = validateConfirmPassword(confirmPassword, password);
      if (confirmError) errors.confirmPassword = confirmError;
    }
    
    setValidationErrors(errors);
  }, [displayName, email, password, confirmPassword]);

  /**
   * Clear all messages
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

    // Validate all fields
    const nameError = validateDisplayName(displayName);
    const emailError = validateEmail(email);
    const pwdError = validatePassword(password);
    const confirmError = validateConfirmPassword(confirmPassword, password);

    if (nameError || emailError || pwdError || confirmError) {
      setValidationErrors({
        displayName: nameError,
        email: emailError,
        password: pwdError,
        confirmPassword: confirmError,
      });
      setError("Please fix the errors in the form.");
      return;
    }

    if (!acceptTerms) {
      setError("You must accept the terms and conditions to register.");
      return;
    }

    try {
      setLoading(true);

      // Create user account with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user: User = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: displayName.trim(),
      });

      // Get and store authentication token
      const token = await user.getIdToken();
      sessionStorage.setItem("userToken", token);
      sessionStorage.setItem("userEmail", user.email || "");
      sessionStorage.setItem("userId", user.uid);
      sessionStorage.setItem("userDisplayName", displayName.trim());

      setSuccess("Account created successfully! Redirecting...");

      // Navigate after a brief delay
      setTimeout(() => {
        navigate("/user/availability");
      }, 1000);

    } catch (err: any) {
      setLoading(false);

      // Handle specific Firebase authentication errors
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists. Please sign in instead.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address format.");
          break;
        case "auth/operation-not-allowed":
          setError("Email/password accounts are not enabled. Please contact support.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Please choose a stronger password.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;
        default:
          setError(err.message || "An error occurred during registration. Please try again.");
      }
    }
  };

  return (
    <section className="user-auth fade-up">
      <div className="container user-auth__grid">
        <div className="user-auth__panel">
          <div className="user-auth__header">
            <p className="pill">Create Account</p>
            <h2>User Registration</h2>
            <p className="modules__subtitle">
              Join our community to access blood availability and donor services.
            </p>
          </div>

          <form className="user-auth__form" onSubmit={handleSubmit}>
            {/* Display Name Field */}
            <label className="user-auth__field">
              <span>Full Name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  clearMessages();
                }}
                placeholder="Enter your full name"
                required
                autoComplete="name"
                disabled={loading}
                aria-label="Full name"
                aria-invalid={!!validationErrors.displayName}
                aria-describedby={validationErrors.displayName ? "name-error" : undefined}
              />
              {validationErrors.displayName && (
                <span id="name-error" style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  {validationErrors.displayName}
                </span>
              )}
            </label>

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
                aria-invalid={!!validationErrors.email}
                aria-describedby={validationErrors.email ? "email-error" : undefined}
              />
              {validationErrors.email && (
                <span id="email-error" style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  {validationErrors.email}
                </span>
              )}
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
                  placeholder="Create a password (min. 6 characters)"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  aria-label="Password"
                  aria-invalid={!!validationErrors.password}
                  aria-describedby={validationErrors.password ? "password-error" : undefined}
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
              {password && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ 
                    display: "flex", 
                    gap: "0.25rem", 
                    marginBottom: "0.25rem",
                    height: "4px",
                    borderRadius: "2px",
                    overflow: "hidden",
                    backgroundColor: "#e5e7eb"
                  }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          backgroundColor: level <= passwordStrength.strength 
                            ? passwordStrength.color 
                            : "#e5e7eb",
                          transition: "background-color 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ 
                    fontSize: "0.75rem", 
                    color: passwordStrength.color,
                    fontWeight: 600
                  }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              {validationErrors.password && (
                <span style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem", display: "block" }}>
                  {validationErrors.password}
                </span>
              )}
            </label>

            {/* Confirm Password Field */}
            <label className="user-auth__field">
              <span>Confirm Password</span>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearMessages();
                  }}
                  placeholder="Re-enter your password"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  aria-label="Confirm password"
                  aria-invalid={!!validationErrors.confirmPassword}
                  aria-describedby={validationErrors.confirmPassword ? "confirm-error" : undefined}
                  style={{ paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <span id="confirm-error" style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  {validationErrors.confirmPassword}
                </span>
              )}
            </label>

            {/* Terms and Conditions */}
            <label style={{ 
              display: "flex", 
              alignItems: "flex-start", 
              gap: "0.5rem",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              marginBottom: "1rem"
            }}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={loading}
                style={{ 
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "0.25rem"
                }}
                required
              />
              <span>
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => console.log("Terms and conditions")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--red-600)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Terms and Conditions
                </button>
                {" "}and{" "}
                <button
                  type="button"
                  onClick={() => console.log("Privacy policy")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--red-600)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Privacy Policy
                </button>
              </span>
            </label>

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
              disabled={loading || Object.keys(validationErrors).length > 0}
              style={{ 
                opacity: (loading || Object.keys(validationErrors).length > 0) ? 0.7 : 1,
                cursor: (loading || Object.keys(validationErrors).length > 0) ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Login Link */}
            <div style={{ 
              textAlign: "center", 
              marginTop: "1.5rem",
              fontSize: "0.875rem",
              color: "var(--gray-700)"
            }}>
              <p>
                Already have an account?{" "}
                <Link
                  to="/user/login"
                  style={{
                    color: "var(--red-600)",
                    textDecoration: "underline",
                    fontWeight: 600,
                  }}
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Hero Section */}
        <div className="user-auth__hero" aria-hidden>
          <div className="user-auth__hero-card">
            <div className="user-auth__hero-icon" />
            <div className="user-auth__hero-glow" />
            <h3>Join Our Community</h3>
            <p>Create your account to access blood availability, register as a donor, and help save lives.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserRegistrationPage;
