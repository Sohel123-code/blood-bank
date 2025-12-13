import React, { useMemo, useState } from "react";
import data from "../data/blood-banks.json";
import { BloodBank, BloodGroupKey } from "../types/bloodBank";

const bloodGroups: BloodGroupKey[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const rareGroups: BloodGroupKey[] = ["AB-", "O-", "B-", "A-"];

const DonorRegistrationModule: React.FC = () => {
  const banks = data as BloodBank[];
  const states = useMemo(() => Array.from(new Set(banks.map((b) => b.state))).sort(), [banks]);
  const [state, setState] = useState("");
  const districts = useMemo(
    () =>
      state
        ? Array.from(new Set(banks.filter((b) => b.state === state).map((b) => b.district))).sort()
        : [],
    [banks, state]
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "A+" as BloodGroupKey,
    state: "",
    district: "",
    date: "",
    time: ""
  });
  const [credits, setCredits] = useState(120);
  const [rareNotice, setRareNotice] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCredits((c) => c + 10);
    setMessage("Registration received. Thank you for donating!");
    if (rareGroups.includes(form.bloodGroup)) {
      setRareNotice(
        "Your blood group is rare. Please store your donation at the nearest bank as soon as possible."
      );
    } else {
      setRareNotice("");
    }
    setTimeout(() => setMessage(""), 3500);
    setTimeout(() => setRareNotice(""), 6000);
  };

  return (
    <section className="donor fade-up">
      <div className="container donor__grid">
        <div className="donor__panel">
          <div className="donor__header">
            <p className="pill">Donor Registration</p>
            <h2>Register to Donate</h2>
            <p className="modules__subtitle">
              Enter your details, choose your slot, and contribute life-saving blood.
            </p>
          </div>
          <div className="donor__credits">Credits: {credits}</div>
          <form className="donor__form" onSubmit={handleSubmit}>
            <div className="donor__row">
              <label className="form-field">
                <span>Full Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </label>
              <label className="form-field">
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="donor__row">
              <label className="form-field">
                <span>Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </label>
              <label className="form-field">
                <span>Blood Group</span>
                <select
                  value={form.bloodGroup}
                  onChange={(e) => handleChange("bloodGroup", e.target.value as BloodGroupKey)}
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="donor__row">
              <label className="form-field">
                <span>State</span>
                <select
                  value={form.state}
                  onChange={(e) => {
                    handleChange("state", e.target.value);
                    setState(e.target.value);
                    handleChange("district", "");
                  }}
                >
                  <option value="">Select state</option>
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>District</span>
                <select value={form.district} onChange={(e) => handleChange("district", e.target.value)}>
                  <option value="">Select district</option>
                  {districts.map((dt) => (
                    <option key={dt} value={dt}>
                      {dt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="donor__row donor__row--compact">
              <label className="form-field">
                <span>Preferred Date</span>
                <input type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} required />
              </label>
              <label className="form-field">
                <span>Preferred Time</span>
                <input type="time" value={form.time} onChange={(e) => handleChange("time", e.target.value)} required />
              </label>
            </div>

            <div className="donor__actions">
              <button className="btn btn-primary" type="submit">
                Submit Registration
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Back to Top
              </button>
            </div>
          </form>
        </div>

        <div className="donor__aside" aria-label="donor highlights">
          <div className="donor__tile">
            <h4>Why donate?</h4>
            <p>Every unit can save up to three lives. Your time matters.</p>
          </div>
          <div className="donor__tile">
            <h4>Fast check-in</h4>
            <p>Share your slot so we can prepare equipment and staff.</p>
          </div>
          <div className="donor__tile">
            <h4>Track credits</h4>
            <p>Earn credits on every donation. Rare groups receive priority handling.</p>
          </div>
        </div>
      </div>

      {message && <div className="slide-toast">{message}</div>}
      {rareNotice && <div className="slide-toast slide-toast--alert">{rareNotice}</div>}
    </section>
  );
};

export default DonorRegistrationModule;

