import React, { useMemo, useState } from "react";
import banksRaw from "../../b.json";
import stateData from "../data/states.json";
import { useNavigate } from "react-router-dom";

type Bank = {
  name: string;
  state: string;
  district: string;
  location: string;
  phone: string;
  blood_groups_available: string[];
  availability: string;
  last_updated: string;
};

const getStatesFromFile = () => {
  const india = (stateData as { India: Record<string, string[]> }).India || {};
  return Object.keys(india).sort((a, b) => a.localeCompare(b));
};
const getDistrictsFromFile = (state: string) => {
  const india = (stateData as { India: Record<string, string[]> }).India || {};
  return [...(india[state] || [])].sort((a, b) => a.localeCompare(b));
};

const BloodAvailabilityModule: React.FC = () => {
  const navigate = useNavigate();
  const banks = useMemo(
    () => Object.values(banksRaw as Record<string, Bank[]>).flat(),
    []
  );
  const states = useMemo(() => getStatesFromFile(), []);
  const [state, setState] = useState("");
  const districts = useMemo(() => (state ? getDistrictsFromFile(state) : []), [state]);
  const [district, setDistrict] = useState("");
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [patientName, setPatientName] = useState("");
  const [results, setResults] = useState<Bank[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !district) {
      setSubmitted(true);
      setResults([]);
      return;
    }
    const filtered = banks
      .filter(
        (b) =>
          (!state || b.state === state) &&
          (!district || b.district === district) &&
          b.blood_groups_available.includes(bloodGroup)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    setResults(filtered);
    setSubmitted(true);
  };

  return (
    <section className="availability fade-up">
      <div className="container availability__grid">
        <div className="availability__panel">
          <p className="pill">Blood Availability</p>
          <h2>Find the Nearest Blood Bank</h2>
          <p className="modules__subtitle">
            Enter patient and location details to check matching blood units across India.
          </p>
          <form className="availability__form" onSubmit={handleSubmit}>
            <div className="availability__row">
              <label className="form-field">
                <span>Patient Name</span>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  required
                />
              </label>
              <label className="form-field">
                <span>Blood Group</span>
                <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="availability__row">
              <label className="form-field">
                <span>State</span>
                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setDistrict("");
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
                <select value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state}>
                  <option value="">{state ? "Select district" : "Choose state first"}</option>
                  {districts.map((dt) => (
                    <option key={dt} value={dt}>
                      {dt}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="availability__actions">
              <button className="btn btn-primary" type="submit">
                Check Availability
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => navigate("/user/donor-registration")}>
                Become a Donor
              </button>
            </div>
          </form>
        </div>

          <div className="availability__results">
            <div className="availability__results-header">
              <h3>Nearest Matches</h3>
              <p className="modules__subtitle">
                {state && district
                  ? `Showing banks offering ${bloodGroup} in ${district}, ${state}`
                  : "Select state and district to view matches."}
              </p>
            </div>
              {submitted && results.length === 0 && (
              <div className="availability__empty">
                  <p>No matching blood units found for the selected filters.</p>
                  <span>Try changing the filters.</span>
              </div>
            )}
            <div className="availability__cards">
              {results.map((bank) => (
                <article key={`${bank.name}-${bank.phone}`} className="availability-card">
                  <div className="availability-card__header">
                    <div>
                      <h4>{bank.name}</h4>
                      <p>{bank.location}</p>
                    </div>
                    <span className="availability-card__badge">{bank.district}</span>
                  </div>
                  <div className="availability-card__meta">
                    <span>{bank.state}</span>
                    <span>{bank.phone}</span>
                    <span
                      className={`availability-status availability-status--${bank.availability
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {bank.availability}
                    </span>
                    <span>{new Date(bank.last_updated).toLocaleString()}</span>
                  </div>
                  <div className="availability-card__grid">
                    {bank.blood_groups_available.map((bg) => (
                      <div key={bg} className="availability-card__chip">
                        <span className="chip__label">{bg}</span>
                        <span className="chip__value">Available</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
      </div>
    </section>
  );
};

export default BloodAvailabilityModule;

