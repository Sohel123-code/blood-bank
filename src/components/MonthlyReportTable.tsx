import React from "react";
import { MonthlyReportRow } from "../types/hospital";

const MonthlyReportTable: React.FC = () => {
  // Dummy monthly report data
  const reportData: MonthlyReportRow[] = [
    {
      patientId: "PAT-2001",
      patientName: "Ravi Kumar",
      age: 45,
      gender: "Male",
      diagnosis: "Cardiac Surgery",
      caseType: "Critical",
      bloodGroup: "B+",
      unitsUsed: 3,
      admissionDate: "01-11-2025",
      dischargeDate: "05-11-2025",
      outcome: "Recovered"
    },
    {
      patientId: "PAT-2002",
      patientName: "Sita Rao",
      age: 32,
      gender: "Female",
      diagnosis: "Accident - Multiple Injuries",
      caseType: "Emergency",
      bloodGroup: "O-",
      unitsUsed: 2,
      admissionDate: "03-11-2025",
      dischargeDate: "08-11-2025",
      outcome: "Recovered"
    },
    {
      patientId: "PAT-2003",
      patientName: "Imran Ali",
      age: 28,
      gender: "Male",
      diagnosis: "Thalassemia",
      caseType: "Routine",
      bloodGroup: "AB+",
      unitsUsed: 1,
      admissionDate: "05-11-2025",
      dischargeDate: "07-11-2025",
      outcome: "Under Treatment"
    },
    {
      patientId: "PAT-2004",
      patientName: "Priya Sharma",
      age: 55,
      gender: "Female",
      diagnosis: "Major Surgery",
      caseType: "Critical",
      bloodGroup: "A+",
      unitsUsed: 4,
      admissionDate: "02-11-2025",
      dischargeDate: "10-11-2025",
      outcome: "Recovered"
    },
    {
      patientId: "PAT-2005",
      patientName: "Rajesh Patel",
      age: 38,
      gender: "Male",
      diagnosis: "Accident - Head Injury",
      caseType: "Emergency",
      bloodGroup: "B-",
      unitsUsed: 2,
      admissionDate: "04-11-2025",
      dischargeDate: "09-11-2025",
      outcome: "Referred"
    },
    {
      patientId: "PAT-2006",
      patientName: "Anita Desai",
      age: 42,
      gender: "Female",
      diagnosis: "Cancer Treatment",
      caseType: "Routine",
      bloodGroup: "O+",
      unitsUsed: 1,
      admissionDate: "06-11-2025",
      dischargeDate: "12-11-2025",
      outcome: "Under Treatment"
    },
    {
      patientId: "PAT-2007",
      patientName: "Vikram Singh",
      age: 50,
      gender: "Male",
      diagnosis: "Kidney Transplant",
      caseType: "Critical",
      bloodGroup: "A-",
      unitsUsed: 5,
      admissionDate: "07-11-2025",
      dischargeDate: "15-11-2025",
      outcome: "Under Treatment"
    },
    {
      patientId: "PAT-2008",
      patientName: "Meera Joshi",
      age: 29,
      gender: "Female",
      diagnosis: "Childbirth Complications",
      caseType: "Emergency",
      bloodGroup: "B+",
      unitsUsed: 2,
      admissionDate: "08-11-2025",
      dischargeDate: "11-11-2025",
      outcome: "Recovered"
    }
  ];

  const totalPatients = reportData.length;
  const totalUnitsUsed = reportData.reduce((sum, row) => sum + row.unitsUsed, 0);

  return (
    <div className="hospital-table">
      <h3 className="hospital-table__title">Report of the Month</h3>
      <div className="hospital-table__summary">
        <div className="summary-item">
          <span className="summary-label">Total Patients:</span>
          <span className="summary-value">{totalPatients}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Units Used:</span>
          <span className="summary-value">{totalUnitsUsed}</span>
        </div>
      </div>
      <div className="hospital-table__container">
        <table className="hospital-table__table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Diagnosis</th>
              <th>Case Type</th>
              <th>Blood Group</th>
              <th>Units Used</th>
              <th>Admission Date</th>
              <th>Discharge Date</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row) => (
              <tr key={row.patientId}>
                <td>{row.patientId}</td>
                <td>{row.patientName}</td>
                <td>{row.age}</td>
                <td>{row.gender}</td>
                <td>{row.diagnosis}</td>
                <td>
                  <span
                    className={`case-type-badge ${
                      row.caseType === "Critical"
                        ? "case-type-badge--critical"
                        : row.caseType === "Emergency"
                          ? "case-type-badge--emergency"
                          : "case-type-badge--routine"
                    }`}
                  >
                    {row.caseType}
                  </span>
                </td>
                <td>{row.bloodGroup}</td>
                <td>{row.unitsUsed}</td>
                <td>{row.admissionDate}</td>
                <td>{row.dischargeDate}</td>
                <td>
                  <span
                    className={`outcome-badge ${
                      row.outcome === "Recovered"
                        ? "outcome-badge--recovered"
                        : row.outcome === "Under Treatment"
                          ? "outcome-badge--treatment"
                          : "outcome-badge--referred"
                    }`}
                  >
                    {row.outcome}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyReportTable;

