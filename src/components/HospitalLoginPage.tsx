import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HospitalLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [hospitalId, setHospitalId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalId.trim() || !password.trim()) {
      setError("Hospital ID and password are required.");
      return;
    }
    setError("");
    navigate("/hospital");
  };

  return (
    <section className="modules fade-up" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <div className="container">
        <div className="modules__header" style={{ marginBottom: "1.5rem" }}>
          <p className="pill">Secure Access</p>
          <h2>Hospital Login</h2>
          <p className="modules__subtitle">
            Enter your hospital credentials to access the secure hospital module.
          </p>
        </div>

        <div className="module-card" style={{ maxWidth: "520px", margin: "0 auto" }}>
          <div className="module-card__content">
            <form className="hospital-form__form" onSubmit={handleSubmit}>
              <div className="hospital-form__field">
                <label htmlFor="hospitalId">Hospital ID</label>
                <input
                  id="hospitalId"
                  type="text"
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  placeholder="Enter your hospital ID"
                  required
                />
              </div>
              <div className="hospital-form__field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button className="btn btn-primary module-card__btn" type="submit">
                Login to Hospital Module
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HospitalLoginPage;

