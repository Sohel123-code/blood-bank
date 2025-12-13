import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Contact", href: "/#contact" }
];

/**
 * Navbar Component with Authentication Support
 * 
 * Features:
 * - Shows user menu when authenticated
 * - Logout functionality
 * - User profile display
 * - Responsive design
 */
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentUser, isAuthenticated, signOut, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Close user menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  /**
   * Get user display name or email
   */
  const getUserDisplayName = (): string => {
    if (!currentUser) return "User";
    return currentUser.displayName || currentUser.email?.split("@")[0] || "User";
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = (): string => {
    if (!currentUser) return "U";
    const name = currentUser.displayName || currentUser.email || "User";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="container navbar__content">
        <button
          className="pill navbar__brand"
          aria-label="Blood Connect logo"
          onClick={() => navigate("/")}
        >
          <span role="img" aria-hidden="true">
            ❤️
          </span>
          Blood Connect
        </button>
        <nav className="navbar__links">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`navbar__link ${pathname === "/" ? "navbar__link--home" : ""}`}
            >
              {item.label}
            </a>
          ))}
          
          {!loading && (
            <>
              {isAuthenticated ? (
                // User Menu
                <div 
                  ref={menuRef}
                  style={{ position: "relative" }}
                >
                  <button
                    className="btn btn-ghost navbar__user-menu"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="User menu"
                    aria-expanded={showUserMenu}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      border: "1px solid transparent",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "50%",
                        backgroundColor: "var(--red-600)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                      }}
                    >
                      {getUserInitials()}
                    </div>
                    <span style={{ 
                      display: "none",
                      "@media (min-width: 768px)": { display: "inline" }
                    } as React.CSSProperties}>
                      {getUserDisplayName()}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        marginTop: "0.5rem",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        minWidth: "200px",
                        zIndex: 1000,
                        overflow: "hidden",
                      }}
                    >
                      {/* User Info */}
                      <div
                        style={{
                          padding: "1rem",
                          borderBottom: "1px solid #e5e7eb",
                          backgroundColor: "#f9fafb",
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                          {currentUser?.displayName || "User"}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "var(--gray-700)" }}>
                          {currentUser?.email}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div style={{ padding: "0.25rem" }}>
                        <button
                          onClick={() => {
                            navigate("/user/availability");
                            setShowUserMenu(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            textAlign: "left",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            color: "var(--gray-900)",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            navigate("/user/donor-registration");
                            setShowUserMenu(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            textAlign: "left",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            color: "var(--gray-900)",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          Donor Registration
                        </button>
                      </div>

                      {/* Logout Button */}
                      <div
                        style={{
                          padding: "0.25rem",
                          borderTop: "1px solid #e5e7eb",
                        }}
                      >
                        <button
                          onClick={handleLogout}
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            textAlign: "left",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            color: "#ef4444",
                            fontWeight: 600,
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fff1f2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Login/Register Buttons
                <>
                  <button
                    className="btn btn-ghost navbar__link"
                    onClick={() => navigate("/user/login")}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Sign In
                  </button>
                  <button
                    className="btn btn-primary navbar__cta"
                    onClick={() => navigate("/user/register")}
                  >
                    Register
                  </button>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
