import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import bloodBanksData from "../../b.json";
import requestsData from "../data/requests.json";

interface BloodBank {
  name: string;
  state: string;
  district: string;
  location: string;
  phone: string;
  blood_groups_available: string[];
  availability: string;
  last_updated: string;
}

type BloodGroupInventory = {
  [key: string]: number;
};

type UserRequest = {
  name: string;
  phone: string;
  aadhar: string;
  blood_required: string;
  urgency: string;
  quantity_units: number;
  reason: string;
  location?: string;
  request_date?: string;
};

type HospitalRequest = {
  hospital_name: string;
  location: string;
  phone: string;
  blood_required: string;
  units_needed: number;
  urgency: string;
  department: string;
};

type DonorRequest = {
  name: string;
  phone: string;
  aadhar: string;
  blood_group: string;
  donation_time: string;
  location: string;
  status: string;
};

const allBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BloodBankDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [bankData, setBankData] = useState<BloodBank | null>(null);
  const [inventory, setInventory] = useState<BloodGroupInventory>({});
  const [creditPoints, setCreditPoints] = useState(0);
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
  const [hospitalRequests, setHospitalRequests] = useState<HospitalRequest[]>([]);
  const [donorRequests, setDonorRequests] = useState<DonorRequest[]>([]);
  const [acceptedUsers, setAcceptedUsers] = useState<UserRequest[]>([]);
  const [acceptedHospitals, setAcceptedHospitals] = useState<HospitalRequest[]>([]);
  const [acceptedDonors, setAcceptedDonors] = useState<DonorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bankName = sessionStorage.getItem("bloodBankName");
    if (!bankName) {
      navigate("/blood-bank/login");
      return;
    }

    // Flatten all states and find the bank
    const allBanks: BloodBank[] = [];
    Object.values(bloodBanksData).forEach((stateBanks: any) => {
      if (Array.isArray(stateBanks)) {
        allBanks.push(...stateBanks);
      }
    });

    const foundBank = allBanks.find(
      (bank) => bank.name.toLowerCase() === bankName.toLowerCase()
    );

    if (foundBank) {
      setBankData(foundBank);
      // Initialize inventory with random values (10-50 units) for available blood groups
      const initialInventory: BloodGroupInventory = {};
      allBloodGroups.forEach((bg) => {
        if (foundBank.blood_groups_available.includes(bg)) {
          initialInventory[bg] = Math.floor(Math.random() * 41) + 10; // Random between 10-50
        } else {
          initialInventory[bg] = 0;
        }
      });
      setInventory(initialInventory);
    } else {
      // If bank not found, create empty dashboard with random inventory
      const defaultBank: BloodBank = {
        name: bankName,
        state: "",
        district: "",
        location: "",
        phone: "",
        blood_groups_available: [],
        availability: "Available",
        last_updated: new Date().toISOString(),
      };
      setBankData(defaultBank);
      const initialInventory: BloodGroupInventory = {};
      allBloodGroups.forEach((bg) => {
        initialInventory[bg] = Math.floor(Math.random() * 41) + 10; // Random between 10-50
      });
      setInventory(initialInventory);
    }

    // Load requests data
    setUserRequests(requestsData.users as UserRequest[]);
    setHospitalRequests(requestsData.hospitals as HospitalRequest[]);
    setDonorRequests(requestsData.donors as DonorRequest[]);

    // Load accepted requests from localStorage
    const savedAccepted = localStorage.getItem("acceptedRequests");
    if (savedAccepted) {
      try {
        const parsed = JSON.parse(savedAccepted);
        setAcceptedUsers(parsed.accepted_users || []);
        setAcceptedHospitals(parsed.accepted_hospitals || []);
        setAcceptedDonors(parsed.accepted_donors || []);
      } catch (e) {
        console.error("Error loading accepted requests:", e);
      }
    }

    // Initialize credit points (based on donations - can be calculated from inventory)
    setCreditPoints(Math.floor(Math.random() * 500) + 100); // Random between 100-600

    setLoading(false);
  }, [navigate]);

  // Save accepted requests to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      const dataToSave = {
        accepted_users: acceptedUsers,
        accepted_hospitals: acceptedHospitals,
        accepted_donors: acceptedDonors,
      };
      localStorage.setItem("acceptedRequests", JSON.stringify(dataToSave));
    }
  }, [acceptedUsers, acceptedHospitals, acceptedDonors, loading]);

  const updateInventory = (bloodGroup: string, delta: number) => {
    setInventory((prev) => {
      const newValue = Math.max(0, (prev[bloodGroup] || 0) + delta);
      return { ...prev, [bloodGroup]: newValue };
    });
  };

  const handleAcceptRequest = (request: UserRequest | HospitalRequest, type: "user" | "hospital") => {
    const bloodGroup = type === "user" ? (request as UserRequest).blood_required : (request as HospitalRequest).blood_required;
    const units = type === "user" ? (request as UserRequest).quantity_units : (request as HospitalRequest).units_needed;
    
    // Update inventory
    updateInventory(bloodGroup, -units);
    
    // Add credit points (1 point per unit)
    setCreditPoints((prev) => prev + units);
    
    // Add to accepted list with timestamp
    const acceptedRequest = {
      ...request,
      accepted_at: new Date().toISOString(),
    };
    
    if (type === "user") {
      setAcceptedUsers((prev) => [...prev, acceptedRequest as UserRequest]);
      setUserRequests((prev) => prev.filter((r) => r !== request));
    } else {
      setAcceptedHospitals((prev) => [...prev, acceptedRequest as HospitalRequest]);
      setHospitalRequests((prev) => prev.filter((r) => r !== request));
    }
  };

  const handleRejectRequest = (request: UserRequest | HospitalRequest, type: "user" | "hospital") => {
    // Simply remove from list
    if (type === "user") {
      setUserRequests((prev) => prev.filter((r) => r !== request));
    } else {
      setHospitalRequests((prev) => prev.filter((r) => r !== request));
    }
  };

  const handleAcceptDonor = (donor: DonorRequest) => {
    const bloodGroup = donor.blood_group;
    
    // Add blood to inventory (1 unit per donation)
    updateInventory(bloodGroup, 1);
    
    // Add credit points (2 points per donation)
    setCreditPoints((prev) => prev + 2);
    
    // Add to accepted list with timestamp
    const acceptedDonor = {
      ...donor,
      accepted_at: new Date().toISOString(),
    };
    
    setAcceptedDonors((prev) => [...prev, acceptedDonor]);
    setDonorRequests((prev) => prev.filter((d) => d !== donor));
  };

  const handleRejectDonor = (donor: DonorRequest) => {
    // Simply remove from list
    setDonorRequests((prev) => prev.filter((d) => d !== donor));
  };

  const getRecommendations = useMemo(() => {
    const recommendations: string[] = [];
    const totalUnits = Object.values(inventory).reduce((sum, val) => sum + val, 0);
    const lowStockGroups = allBloodGroups.filter((bg) => (inventory[bg] || 0) < 10);
    const criticalGroups = allBloodGroups.filter((bg) => (inventory[bg] || 0) < 5);

    if (criticalGroups.length > 0) {
      recommendations.push(`⚠️ Critical: ${criticalGroups.join(", ")} blood groups are critically low (< 5 units)`);
    }
    if (lowStockGroups.length > 0 && criticalGroups.length === 0) {
      recommendations.push(`⚠️ Low Stock: ${lowStockGroups.join(", ")} blood groups are running low (< 10 units)`);
    }
    if (totalUnits < 50) {
      recommendations.push(`📊 Overall inventory is below recommended levels. Consider organizing a blood drive.`);
    }
    if (totalUnits > 200) {
      recommendations.push(`✅ Excellent inventory levels! Consider sharing excess units with nearby banks.`);
    }
    if (recommendations.length === 0) {
      recommendations.push(`✅ All blood groups are at healthy levels. Keep up the great work!`);
    }

    return recommendations;
  }, [inventory]);

  const handleLogout = () => {
    sessionStorage.removeItem("bloodBankName");
    navigate("/blood-bank/login");
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#22c55e";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <section className="availability fade-up">
        <div className="container">
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!bankData) {
    return (
      <section className="availability fade-up">
        <div className="container">
          <p>Unable to load dashboard.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="availability fade-up">
      <div className="container">
        {/* Header */}
        <div className="blood-bank-dashboard__header">
          <div>
            <h2>{bankData.name}</h2>
            <p className="modules__subtitle">Blood Inventory Management Dashboard</p>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div className="blood-bank-dashboard__credits">
              <span className="credits-label">Credit Points:</span>
              <span className="credits-value">{creditPoints}</span>
            </div>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="blood-bank-dashboard__main-grid">
          {/* Left Column - Inventory & Recommendations */}
          <div className="blood-bank-dashboard__left-column">
            {/* Recommendations Section */}
            <div className="blood-bank-dashboard__panel blood-bank-dashboard__recommendations">
              <div className="blood-bank-dashboard__panel-header">
                <h3>📋 Recommendations</h3>
              </div>
              <div className="blood-bank-dashboard__recommendations-list">
                {getRecommendations.map((rec, idx) => (
                  <div key={idx} className="blood-bank-dashboard__recommendation-item">
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Details */}
            {bankData.state && (
              <div className="blood-bank-dashboard__panel">
                <div className="blood-bank-dashboard__panel-header">
                  <h3>🏥 Bank Information</h3>
                </div>
                <div className="blood-bank-dashboard__info-grid">
                  <div className="blood-bank-dashboard__info-item">
                    <span className="info-label">State:</span>
                    <span className="info-value">{bankData.state}</span>
                  </div>
                  <div className="blood-bank-dashboard__info-item">
                    <span className="info-label">District:</span>
                    <span className="info-value">{bankData.district}</span>
                  </div>
                  <div className="blood-bank-dashboard__info-item">
                    <span className="info-label">Location:</span>
                    <span className="info-value">{bankData.location}</span>
                  </div>
                  <div className="blood-bank-dashboard__info-item">
                    <span className="info-label">Phone:</span>
                    <span className="info-value">{bankData.phone}</span>
                  </div>
                  <div className="blood-bank-dashboard__info-item">
                    <span className="info-label">Status:</span>
                    <span
                      className="info-value"
                      style={{
                        color:
                          bankData.availability === "Available"
                            ? "#22c55e"
                            : bankData.availability === "Low Stock"
                            ? "#f59e0b"
                            : "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      {bankData.availability}
                    </span>
                  </div>
                  <div className="blood-bank-dashboard__info-item">
                    <span className="info-label">Last Updated:</span>
                    <span className="info-value">
                      {new Date(bankData.last_updated).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Blood Inventory Management */}
            <div className="blood-bank-dashboard__panel blood-bank-dashboard__inventory">
              <div className="blood-bank-dashboard__panel-header">
                <h3>🩸 Blood Inventory Management</h3>
                <p className="modules__subtitle" style={{ margin: "0.5rem 0 0", fontSize: "0.95rem" }}>
                  Current inventory levels - Update using +/- buttons below
                </p>
              </div>
              <div className="blood-bank-dashboard__inventory-grid">
                {allBloodGroups.map((bg) => {
                  const count = inventory[bg] || 0;
                  const isLow = count < 10;
                  const isCritical = count < 5;
                  return (
                    <div
                      key={bg}
                      className={`blood-bank-dashboard__inventory-card ${
                        isCritical ? "inventory-critical" : isLow ? "inventory-low" : ""
                      }`}
                    >
                      <div className="inventory-card__header">
                        <span className="inventory-card__label">{bg}</span>
                        <span className={`inventory-card__status ${isCritical ? "status-critical" : isLow ? "status-low" : "status-ok"}`}>
                          {isCritical ? "Critical" : isLow ? "Low" : "OK"}
                        </span>
                      </div>
                      <div className="inventory-card__controls">
                        <button
                          className="inventory-btn inventory-btn--decrease"
                          onClick={() => updateInventory(bg, -1)}
                          disabled={count === 0}
                          aria-label={`Decrease ${bg} by 1`}
                        >
                          −
                        </button>
                        <div className="inventory-card__count">
                          <span className="count-value">{count}</span>
                          <span className="count-unit">units</span>
                        </div>
                        <button
                          className="inventory-btn inventory-btn--increase"
                          onClick={() => updateInventory(bg, 1)}
                          aria-label={`Increase ${bg} by 1`}
                        >
                          +
                        </button>
                      </div>
                      <div className="inventory-card__actions">
                        <button
                          className="inventory-btn-small"
                          onClick={() => updateInventory(bg, -5)}
                          disabled={count < 5}
                        >
                          -5
                        </button>
                        <button
                          className="inventory-btn-small"
                          onClick={() => updateInventory(bg, 5)}
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="blood-bank-dashboard__summary">
                <div className="summary-item">
                  <span className="summary-label">Total Units:</span>
                  <span className="summary-value">
                    {Object.values(inventory).reduce((sum, val) => sum + val, 0)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Available Groups:</span>
                  <span className="summary-value">
                    {allBloodGroups.filter((bg) => (inventory[bg] || 0) > 0).length} / {allBloodGroups.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Requests & Donors */}
          <div className="blood-bank-dashboard__right-column">
            {/* Blood Requests Section */}
            <div className="blood-bank-dashboard__panel blood-bank-dashboard__requests">
              <div className="blood-bank-dashboard__panel-header">
                <h3>📥 Blood Requests</h3>
                <p className="modules__subtitle" style={{ margin: "0.5rem 0 0", fontSize: "0.95rem" }}>
                  Manage requests from users and hospitals
                </p>
              </div>

              {/* User Requests */}
              <div className="requests-section">
                <h4 className="requests-section__title">👤 User Requests ({userRequests.length})</h4>
                <div className="requests-list">
                  {userRequests.length === 0 ? (
                    <p className="requests-empty">No user requests</p>
                  ) : (
                    userRequests.map((request, idx) => (
                      <div key={idx} className="request-card">
                        <div className="request-card__header">
                          <div>
                            <h5>{request.name}</h5>
                            <p className="request-card__meta">
                              {request.phone} • {request.blood_required} • {request.quantity_units} units
                            </p>
                          </div>
                          <span
                            className="request-card__urgency"
                            style={{ backgroundColor: getUrgencyColor(request.urgency) }}
                          >
                            {request.urgency}
                          </span>
                        </div>
                        <p className="request-card__reason">{request.reason}</p>
                        <div className="request-card__actions">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAcceptRequest(request, "user")}
                            disabled={(inventory[request.blood_required] || 0) < request.quantity_units}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleRejectRequest(request, "user")}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Hospital Requests */}
              <div className="requests-section">
                <h4 className="requests-section__title">🏥 Hospital Requests ({hospitalRequests.length})</h4>
                <div className="requests-list">
                  {hospitalRequests.length === 0 ? (
                    <p className="requests-empty">No hospital requests</p>
                  ) : (
                    hospitalRequests.map((request, idx) => (
                      <div key={idx} className="request-card">
                        <div className="request-card__header">
                          <div>
                            <h5>{request.hospital_name}</h5>
                            <p className="request-card__meta">
                              {request.location} • {request.phone} • {request.blood_required} • {request.units_needed} units
                            </p>
                          </div>
                          <span
                            className="request-card__urgency"
                            style={{ backgroundColor: getUrgencyColor(request.urgency) }}
                          >
                            {request.urgency}
                          </span>
                        </div>
                        <p className="request-card__reason">{request.department}</p>
                        <div className="request-card__actions">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAcceptRequest(request, "hospital")}
                            disabled={(inventory[request.blood_required] || 0) < request.units_needed}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleRejectRequest(request, "hospital")}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Donor Requests Section */}
            <div className="blood-bank-dashboard__panel blood-bank-dashboard__donors">
              <div className="blood-bank-dashboard__panel-header">
                <h3>🩸 Donor Requests</h3>
                <p className="modules__subtitle" style={{ margin: "0.5rem 0 0", fontSize: "0.95rem" }}>
                  Members ready to donate blood ({donorRequests.length} available)
                </p>
              </div>
              <div className="donors-list">
                {donorRequests.length === 0 ? (
                  <p className="requests-empty">No donor requests</p>
                ) : (
                  donorRequests.map((donor, idx) => (
                    <div key={idx} className="donor-card">
                      <div className="donor-card__header">
                        <div>
                          <h5>{donor.name}</h5>
                          <p className="donor-card__meta">
                            {donor.phone} • {donor.blood_group} • {donor.location}
                          </p>
                        </div>
                        <span className="donor-card__status">{donor.status}</span>
                      </div>
                      <div className="donor-card__time">
                        <span className="donor-card__time-label">Donation Time:</span>
                        <span className="donor-card__time-value">
                          {new Date(donor.donation_time).toLocaleString()}
                        </span>
                      </div>
                      <div className="donor-card__actions">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleAcceptDonor(donor)}
                        >
                          Accept Donation
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleRejectDonor(donor)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Accepted Requests Column */}
          <div className="blood-bank-dashboard__accepted-column">
            <div className="blood-bank-dashboard__panel blood-bank-dashboard__accepted">
              <div className="blood-bank-dashboard__panel-header">
                <h3>✅ Accepted Requests</h3>
                <p className="modules__subtitle" style={{ margin: "0.5rem 0 0", fontSize: "0.95rem" }}>
                  History of all accepted requests and donations
                </p>
              </div>

              {/* Accepted User Requests */}
              <div className="requests-section">
                <h4 className="requests-section__title accepted-title">
                  👤 Accepted Users ({acceptedUsers.length})
                </h4>
                <div className="requests-list">
                  {acceptedUsers.length === 0 ? (
                    <p className="requests-empty">No accepted user requests</p>
                  ) : (
                    acceptedUsers.map((request, idx) => (
                      <div key={idx} className="request-card accepted-card">
                        <div className="request-card__header">
                          <div>
                            <h5>{request.name}</h5>
                            <p className="request-card__meta">
                              {request.phone} • {request.blood_required} • {request.quantity_units} units
                            </p>
                          </div>
                          <span className="accepted-badge">✓ Accepted</span>
                        </div>
                        <p className="request-card__reason">{request.reason}</p>
                        {(request as any).accepted_at && (
                          <p className="accepted-time">
                            Accepted: {new Date((request as any).accepted_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Accepted Hospital Requests */}
              <div className="requests-section">
                <h4 className="requests-section__title accepted-title">
                  🏥 Accepted Hospitals ({acceptedHospitals.length})
                </h4>
                <div className="requests-list">
                  {acceptedHospitals.length === 0 ? (
                    <p className="requests-empty">No accepted hospital requests</p>
                  ) : (
                    acceptedHospitals.map((request, idx) => (
                      <div key={idx} className="request-card accepted-card">
                        <div className="request-card__header">
                          <div>
                            <h5>{request.hospital_name}</h5>
                            <p className="request-card__meta">
                              {request.location} • {request.phone} • {request.blood_required} • {request.units_needed} units
                            </p>
                          </div>
                          <span className="accepted-badge">✓ Accepted</span>
                        </div>
                        <p className="request-card__reason">{request.department}</p>
                        {(request as any).accepted_at && (
                          <p className="accepted-time">
                            Accepted: {new Date((request as any).accepted_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Accepted Donors */}
              <div className="requests-section">
                <h4 className="requests-section__title accepted-title">
                  🩸 Accepted Donors ({acceptedDonors.length})
                </h4>
                <div className="donors-list">
                  {acceptedDonors.length === 0 ? (
                    <p className="requests-empty">No accepted donors</p>
                  ) : (
                    acceptedDonors.map((donor, idx) => (
                      <div key={idx} className="donor-card accepted-card">
                        <div className="donor-card__header">
                          <div>
                            <h5>{donor.name}</h5>
                            <p className="donor-card__meta">
                              {donor.phone} • {donor.blood_group} • {donor.location}
                            </p>
                          </div>
                          <span className="accepted-badge">✓ Accepted</span>
                        </div>
                        <div className="donor-card__time">
                          <span className="donor-card__time-label">Donation Time:</span>
                          <span className="donor-card__time-value">
                            {new Date(donor.donation_time).toLocaleString()}
                          </span>
                        </div>
                        {(donor as any).accepted_at && (
                          <p className="accepted-time">
                            Accepted: {new Date((donor as any).accepted_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BloodBankDashboard;
