import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * DeliveryLoginPage - Delivery Portal Login Component
 * 
 * Simple authentication for delivery personnel
 * Similar to BloodBankLoginPage structure
 */
const DeliveryLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [deliveryId, setDeliveryId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!deliveryId.trim()) {
      setError("Delivery ID is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    // Simple authentication - in production, this would validate against a database
    // For now, accept any non-empty credentials
    sessionStorage.setItem("deliveryId", deliveryId.trim());
    sessionStorage.setItem("deliveryName", `Delivery Agent ${deliveryId.trim()}`);
    navigate("/delivery/dashboard");
  };

  return (
    <section className="modules fade-up" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <div className="container">
        <div className="modules__header" style={{ marginBottom: "1.5rem" }}>
          <p className="pill">Delivery Portal</p>
          <h2>Delivery Login</h2>
          <p className="modules__subtitle">
            Access the delivery dashboard to manage blood delivery requests.
          </p>
        </div>

        <div className="module-card" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
            <label className="user-auth__field" style={{ marginBottom: "1.5rem" }}>
              <span>Delivery ID</span>
              <input
                type="text"
                value={deliveryId}
                onChange={(e) => {
                  setDeliveryId(e.target.value);
                  setError("");
                }}
                placeholder="Enter your delivery ID"
                required
                autoComplete="username"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  fontSize: "1rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  marginTop: "0.5rem",
                }}
              />
            </label>

            <label className="user-auth__field" style={{ marginBottom: "1.5rem" }}>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  fontSize: "1rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  marginTop: "0.5rem",
                }}
              />
            </label>

            {error && (
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecdd3",
                  borderRadius: "0.5rem",
                  color: "#b91c1c",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}

            <button
              className="btn btn-primary"
              type="submit"
              style={{ width: "100%", padding: "0.75rem" }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default DeliveryLoginPage;
