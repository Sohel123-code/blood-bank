import React, { useMemo } from "react";
import requestsData from "../data/requests.json";

interface Donor {
  name: string;
  phone: string;
  aadhar: string;
  blood_group: string;
  donation_time: string;
  location: string;
  status: string;
}

const BloodSpoilageModule: React.FC = () => {
  const spoilageData = useMemo(() => {
    const donors = (requestsData.donors || []) as Donor[];
    const SPOILAGE_DAYS = 42;
    const now = new Date();
    
    return donors.map(donor => {
      const donationDate = new Date(donor.donation_time);
      const daysSinceDonation = Math.floor(
        (now.getTime() - donationDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Handle future dates (donations scheduled but not yet made)
      const isFutureDonation = daysSinceDonation < 0;
      
      if (isFutureDonation) {
        return {
          ...donor,
          donationDate: donationDate.toLocaleDateString(),
          daysSinceDonation: 0,
          daysUntilSpoilage: SPOILAGE_DAYS,
          isSpoiled: false,
          isExpiringSoon: false,
          isFutureDonation: true,
          status: 'Scheduled'
        };
      }
      
      const daysUntilSpoilage = SPOILAGE_DAYS - daysSinceDonation;
      const isSpoiled = daysUntilSpoilage <= 0;
      const isExpiringSoon = daysUntilSpoilage <= 7 && daysUntilSpoilage > 0;
      
      return {
        ...donor,
        donationDate: donationDate.toLocaleDateString(),
        daysSinceDonation,
        daysUntilSpoilage: isSpoiled ? 0 : daysUntilSpoilage,
        isSpoiled,
        isExpiringSoon,
        isFutureDonation: false,
        status: isSpoiled ? 'Spoiled' : isExpiringSoon ? 'Expiring Soon' : 'Fresh'
      };
    }).sort((a, b) => {
      // Sort: future donations first, then by days until spoilage
      if (a.isFutureDonation && !b.isFutureDonation) return -1;
      if (!a.isFutureDonation && b.isFutureDonation) return 1;
      return a.daysUntilSpoilage - b.daysUntilSpoilage;
    });
  }, []);

  const summary = useMemo(() => {
    const total = spoilageData.length;
    const spoiled = spoilageData.filter(d => d.isSpoiled).length;
    const expiringSoon = spoilageData.filter(d => d.isExpiringSoon).length;
    const futureDonations = spoilageData.filter(d => d.isFutureDonation).length;
    const fresh = total - spoiled - expiringSoon - futureDonations;
    
    // Separate donations by status
    const freshDonations = spoilageData.filter(d => !d.isSpoiled && !d.isExpiringSoon && !d.isFutureDonation);
    const expiringDonations = spoilageData.filter(d => d.isExpiringSoon);
    const spoiledDonations = spoilageData.filter(d => d.isSpoiled);
    const futureDonationsList = spoilageData.filter(d => d.isFutureDonation);
    
    return { 
      total, 
      spoiled, 
      expiringSoon, 
      fresh, 
      futureDonations,
      freshDonations, 
      expiringDonations, 
      spoiledDonations,
      futureDonationsList
    };
  }, [spoilageData]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Spoiled':
        return 'status-badge--spoiled';
      case 'Expiring Soon':
        return 'status-badge--expiring';
      case 'Scheduled':
        return 'status-badge--scheduled';
      default:
        return 'status-badge--fresh';
    }
  };

  const getDaysClass = (days: number, isSpoiled: boolean, isFutureDonation?: boolean) => {
    if (isFutureDonation) return 'days-badge--scheduled';
    if (isSpoiled) return 'days-badge--spoiled';
    if (days <= 7) return 'days-badge--expiring';
    return 'days-badge--fresh';
  };

  return (
    <div className="ai-module">
      <div className="ai-module__header">
        <h2>Blood Spoilage Tracker</h2>
        <p className="ai-module__subtitle">
          Monitor blood donations and track days until spoilage (42 days shelf life)
        </p>
      </div>

      <div className="ai-module__content">
        {/* Summary Cards */}
        <div className="spoilage-summary">
          <div className="summary-card summary-card--total">
            <div className="summary-card__label">Total Donations</div>
            <div className="summary-card__value">{summary.total}</div>
          </div>
          <div className="summary-card summary-card--fresh">
            <div className="summary-card__label">Fresh</div>
            <div className="summary-card__value">{summary.fresh}</div>
          </div>
          <div className="summary-card summary-card--expiring">
            <div className="summary-card__label">Expiring Soon</div>
            <div className="summary-card__value">{summary.expiringSoon}</div>
          </div>
          <div className="summary-card summary-card--spoiled">
            <div className="summary-card__label">Spoiled</div>
            <div className="summary-card__value">{summary.spoiled}</div>
          </div>
        </div>

        {/* Fresh Donations */}
        <div className="ai-module__section">
          <h3 className="section-title section-title--fresh">
            ✅ Fresh Donations ({summary.fresh})
          </h3>
          {summary.fresh > 0 ? (
            <div className="spoilage-table-container">
              <table className="spoilage-table">
                <thead>
                  <tr>
                    <th>Donor Name</th>
                    <th>Blood Group</th>
                    <th>Location</th>
                    <th>Donation Date</th>
                    <th>Days Since Donation</th>
                    <th>Days Until Spoilage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.freshDonations.map((donation, index) => (
                    <tr key={`fresh-${donation.aadhar}-${index}`}>
                      <td>{donation.name}</td>
                      <td>
                        <span className="blood-group-badge">{donation.blood_group}</span>
                      </td>
                      <td>{donation.location}</td>
                      <td>{donation.donationDate}</td>
                      <td>{donation.daysSinceDonation} days</td>
                      <td>
                        <span className={`days-badge ${getDaysClass(donation.daysUntilSpoilage, donation.isSpoiled, donation.isFutureDonation)}`}>
                          {donation.daysUntilSpoilage} days
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(donation.status)}`}>
                          {donation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No fresh donations available.</div>
          )}
        </div>

        {/* Expiring Soon Donations */}
        <div className="ai-module__section">
          <h3 className="section-title section-title--expiring">
            ⚠️ Expiring Soon ({summary.expiringSoon})
          </h3>
          {summary.expiringSoon > 0 ? (
            <div className="spoilage-table-container">
              <table className="spoilage-table">
                <thead>
                  <tr>
                    <th>Donor Name</th>
                    <th>Blood Group</th>
                    <th>Location</th>
                    <th>Donation Date</th>
                    <th>Days Since Donation</th>
                    <th>Days Until Spoilage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.expiringDonations.map((donation, index) => (
                    <tr key={`expiring-${donation.aadhar}-${index}`}>
                      <td>{donation.name}</td>
                      <td>
                        <span className="blood-group-badge">{donation.blood_group}</span>
                      </td>
                      <td>{donation.location}</td>
                      <td>{donation.donationDate}</td>
                      <td>{donation.daysSinceDonation} days</td>
                      <td>
                        <span className={`days-badge ${getDaysClass(donation.daysUntilSpoilage, donation.isSpoiled, donation.isFutureDonation)}`}>
                          {donation.daysUntilSpoilage} days
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(donation.status)}`}>
                          {donation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No donations expiring soon.</div>
          )}
        </div>

        {/* Spoiled Donations */}
        <div className="ai-module__section">
          <h3 className="section-title section-title--spoiled">
            🚨 Spoiled Donations ({summary.spoiled})
          </h3>
          {summary.spoiled > 0 ? (
            <div className="spoilage-table-container">
              <table className="spoilage-table">
                <thead>
                  <tr>
                    <th>Donor Name</th>
                    <th>Blood Group</th>
                    <th>Location</th>
                    <th>Donation Date</th>
                    <th>Days Since Donation</th>
                    <th>Days Until Spoilage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.spoiledDonations.map((donation, index) => (
                    <tr key={`spoiled-${donation.aadhar}-${index}`}>
                      <td>{donation.name}</td>
                      <td>
                        <span className="blood-group-badge">{donation.blood_group}</span>
                      </td>
                      <td>{donation.location}</td>
                      <td>{donation.donationDate}</td>
                      <td>{donation.daysSinceDonation} days</td>
                      <td>
                        <span className={`days-badge ${getDaysClass(donation.daysUntilSpoilage, donation.isSpoiled, donation.isFutureDonation)}`}>
                          Spoiled
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(donation.status)}`}>
                          {donation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No spoiled donations.</div>
          )}
        </div>

        {/* Warning Section */}
        {summary.expiringSoon > 0 && (
          <div className="ai-module__section ai-module__section--warning">
            <div className="warning-box">
              <h4>⚠️ Action Required</h4>
              <p>
                {summary.expiringSoon} blood donation{summary.expiringSoon !== 1 ? 's' : ''} 
                {' '}will expire within 7 days. Please prioritize usage of these units.
              </p>
            </div>
          </div>
        )}

        {summary.spoiled > 0 && (
          <div className="ai-module__section ai-module__section--alert">
            <div className="alert-box">
              <h4>🚨 Critical Alert</h4>
              <p>
                {summary.spoiled} blood donation{summary.spoiled !== 1 ? 's' : ''} 
                {' '}has/have already expired and should be disposed of immediately.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodSpoilageModule;

