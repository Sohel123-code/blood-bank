import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import bloodBanksData from "../../b.json";

const BloodBankLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [passkey, setPasskey] = useState("");
   const [error, setError] = useState("");

  // Flatten all blood banks from JSON for matching
  const allBanks = useMemo(() => {
    const banks: Array<{ name: string }> = [];
    Object.values(bloodBanksData).forEach((stateBanks: any) => {
      if (Array.isArray(stateBanks)) {
        banks.push(...stateBanks);
      }
    });
    return banks;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Blood bank name is required.");
      return;
    }

    // Match the entered name against JSON data (case-insensitive)
    const matchedBank = allBanks.find(
      (bank) => bank.name.toLowerCase().trim() === name.toLowerCase().trim()
    );

    if (!matchedBank) {
      setError("Blood bank not found in records. Please check the name.");
      return;
    }

    // Store the matched bank name (passkey is ignored)
    sessionStorage.setItem("bloodBankName", matchedBank.name);
    navigate("/blood-bank/dashboard");
  };

  return (
    <section className="modules fade-up" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <div className="container">
        <div className="modules__header" style={{ marginBottom: "1.5rem" }}>
          <p className="pill">Secure Access</p>
          <h2>Blood Bank Login</h2>
          <p className="modules__subtitle">
            Enter your blood bank name and passkey to access your inventory dashboard.
          </p>
        </div>

        <div className="module-card" style={{ maxWidth: "520px", margin: "0 auto" }}>
          <div className="module-card__content">
            <form className="hospital-form__form" onSubmit={handleSubmit}>
              <div className="hospital-form__field">
                <label htmlFor="bankName">Blood Bank Name</label>
                <input
                  id="bankName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter blood bank name"
                  required
                />
              </div>
              <div className="hospital-form__field">
                <label htmlFor="passkey">Passkey (Optional)</label>
                <input
                  id="passkey"
                  type="text"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter passkey (optional)"
                />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button className="btn btn-success module-card__btn" type="submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BloodBankLoginPage;

