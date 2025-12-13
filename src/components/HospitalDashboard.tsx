import React, { useState } from "react";
import FeatureCard from "./FeatureCard";
import WizardModal from "./WizardModal";
import { useToast } from "./ToastProvider";
import {
  submitPatient,
  createEmergencyRequest,
  generateMonthlyReport,
  trackRequestStatus
} from "../services/mockApi";

type PatientWizard = {
  name: string;
  age: string;
  gender: string;
  mobile: string;
  hospitalId: string;
  bloodGroup: string;
  conditions: string;
  doctor: string;
  department: string;
  ward: string;
  admissionDate: string;
  urgency: string;
};

type EmergencyWizard = {
  patientName: string;
  hospitalId: string;
  bloodGroup: string;
  units: string;
  urgency: string;
  timeNeeded: string;
  location: string;
  contactPerson: string;
  contactNumber: string;
};

type ReportWizard = {
  month: string;
  year: string;
  bloodGroup: string;
  department: string;
  caseType: string;
};

type TrackWizard = {
  requestId: string;
  patientId: string;
  dateFrom: string;
  dateTo: string;
  status: string;
};

const initialPatient: PatientWizard = {
  name: "",
  age: "",
  gender: "",
  mobile: "",
  hospitalId: "",
  bloodGroup: "",
  conditions: "",
  doctor: "",
  department: "",
  ward: "",
  admissionDate: "",
  urgency: "Normal"
};

const initialEmergency: EmergencyWizard = {
  patientName: "",
  hospitalId: "",
  bloodGroup: "",
  units: "",
  urgency: "High",
  timeNeeded: "",
  location: "",
  contactPerson: "",
  contactNumber: ""
};

const initialReport: ReportWizard = {
  month: "",
  year: "",
  bloodGroup: "",
  department: "",
  caseType: ""
};

const initialTrack: TrackWizard = {
  requestId: "",
  patientId: "",
  dateFrom: "",
  dateTo: "",
  status: ""
};

const HospitalDashboard: React.FC = () => {
  const { addToast } = useToast();

  const [patientOpen, setPatientOpen] = useState(false);
  const [patientData, setPatientData] = useState<PatientWizard>(initialPatient);
  const [patientStep, setPatientStep] = useState(0);

  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyData, setEmergencyData] = useState<EmergencyWizard>(initialEmergency);
  const [emergencyStep, setEmergencyStep] = useState(0);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportWizard>(initialReport);
  const [reportStep, setReportStep] = useState(0);

  const [trackOpen, setTrackOpen] = useState(false);
  const [trackData, setTrackData] = useState<TrackWizard>(initialTrack);
  const [trackStep, setTrackStep] = useState(0);

  const validateRequired = (fields: string[], data: Record<string, string>) => {
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
      if (!data[f]) errs[f] = "Required";
    });
    return errs;
  };

  const patientSteps = [
    {
      label: "Basic details",
      validate: (d: PatientWizard) => validateRequired(["name", "age", "gender", "mobile", "hospitalId"], d),
      render: (d: PatientWizard, setD: React.Dispatch<React.SetStateAction<PatientWizard>>, errors: Record<string, string>) => (
        <div className="wizard__grid">
          <div className="form-field">
            <label>Patient Name *</label>
            <input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-field">
            <label>Age *</label>
            <input value={d.age} onChange={(e) => setD({ ...d, age: e.target.value })} />
            {errors.age && <span className="form-error">{errors.age}</span>}
          </div>
          <div className="form-field">
            <label>Gender *</label>
            <select value={d.gender} onChange={(e) => setD({ ...d, gender: e.target.value })}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <span className="form-error">{errors.gender}</span>}
          </div>
          <div className="form-field">
            <label>Mobile *</label>
            <input value={d.mobile} onChange={(e) => setD({ ...d, mobile: e.target.value })} />
            {errors.mobile && <span className="form-error">{errors.mobile}</span>}
          </div>
          <div className="form-field">
            <label>Hospital ID *</label>
            <input value={d.hospitalId} onChange={(e) => setD({ ...d, hospitalId: e.target.value })} />
            {errors.hospitalId && <span className="form-error">{errors.hospitalId}</span>}
          </div>
        </div>
      )
    },
    {
      label: "Medical details",
      validate: (d: PatientWizard) => validateRequired(["bloodGroup", "doctor", "department"], d),
      render: (d, setD, errors) => (
        <div className="wizard__grid">
          <div className="form-field">
            <label>Blood Group *</label>
            <select value={d.bloodGroup} onChange={(e) => setD({ ...d, bloodGroup: e.target.value })}>
              <option value="">Select</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
            {errors.bloodGroup && <span className="form-error">{errors.bloodGroup}</span>}
          </div>
          <div className="form-field">
            <label>Conditions</label>
            <input value={d.conditions} onChange={(e) => setD({ ...d, conditions: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Doctor Name *</label>
            <input value={d.doctor} onChange={(e) => setD({ ...d, doctor: e.target.value })} />
            {errors.doctor && <span className="form-error">{errors.doctor}</span>}
          </div>
          <div className="form-field">
            <label>Department *</label>
            <input value={d.department} onChange={(e) => setD({ ...d, department: e.target.value })} />
            {errors.department && <span className="form-error">{errors.department}</span>}
          </div>
        </div>
      )
    },
    {
      label: "Admission details",
      validate: (d: PatientWizard) => validateRequired(["ward", "admissionDate", "urgency"], d),
      render: (d, setD, errors) => (
        <div className="wizard__grid">
          <div className="form-field">
            <label>Ward / Bed *</label>
            <input value={d.ward} onChange={(e) => setD({ ...d, ward: e.target.value })} />
            {errors.ward && <span className="form-error">{errors.ward}</span>}
          </div>
          <div className="form-field">
            <label>Admission Date *</label>
            <input type="date" value={d.admissionDate} onChange={(e) => setD({ ...d, admissionDate: e.target.value })} />
            {errors.admissionDate && <span className="form-error">{errors.admissionDate}</span>}
          </div>
          <div className="form-field">
            <label>Urgency *</label>
            <select value={d.urgency} onChange={(e) => setD({ ...d, urgency: e.target.value })}>
              <option value="">Select</option>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Critical">Critical</option>
            </select>
            {errors.urgency && <span className="form-error">{errors.urgency}</span>}
          </div>
        </div>
      )
    }
  ];

  const emergencySteps = [
    {
      label: "Patient & Hospital",
      validate: (d: EmergencyWizard) => validateRequired(["patientName", "hospitalId"], d),
      render: (d, setD, errors) => (
        <div className="wizard__grid">
          <div className="form-field">
            <label>Patient Name *</label>
            <input value={d.patientName} onChange={(e) => setD({ ...d, patientName: e.target.value })} />
            {errors.patientName && <span className="form-error">{errors.patientName}</span>}
          </div>
          <div className="form-field">
            <label>Hospital ID *</label>
            <input value={d.hospitalId} onChange={(e) => setD({ ...d, hospitalId: e.target.value })} />
            {errors.hospitalId && <span className="form-error">{errors.hospitalId}</span>}
          </div>
        </div>
      )
    },
    {
      label: "Blood requirements",
      validate: (d: EmergencyWizard) => validateRequired(["bloodGroup", "units", "urgency", "timeNeeded"], d),
      render: (d, setD, errors) => (
        <div className="wizard__grid">
          <div className="form-field">
            <label>Blood Group *</label>
            <select value={d.bloodGroup} onChange={(e) => setD({ ...d, bloodGroup: e.target.value })}>
              <option value="">Select</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
            {errors.bloodGroup && <span className="form-error">{errors.bloodGroup}</span>}
          </div>
          <div className="form-field">
            <label>Units *</label>
            <input type="number" value={d.units} onChange={(e) => setD({ ...d, units: e.target.value })} />
            {errors.units && <span className="form-error">{errors.units}</span>}
          </div>
          <div className="form-field">
            <label>Urgency *</label>
            <select value={d.urgency} onChange={(e) => setD({ ...d, urgency: e.target.value })}>
              <option value="">Select</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
              <option value="Normal">Normal</option>
            </select>
            {errors.urgency && <span className="form-error">{errors.urgency}</span>}
          </div>
          <div className="form-field">
            <label>Needed Within *</label>
            <input value={d.timeNeeded} onChange={(e) => setD({ ...d, timeNeeded: e.target.value })} placeholder="e.g., 2 hours" />
            {errors.timeNeeded && <span className="form-error">{errors.timeNeeded}</span>}
          </div>
        </div>
      )
    },
    {
      label: "Location & Contact",
      validate: (d: EmergencyWizard) => validateRequired(["location", "contactPerson", "contactNumber"], d),
      render: (d, setD, errors) => (
        <div className="wizard__grid">
          <div className="form-field">
            <label>Location *</label>
            <input value={d.location} onChange={(e) => setD({ ...d, location: e.target.value })} />
            {errors.location && <span className="form-error">{errors.location}</span>}
          </div>
          <div className="form-field">
            <label>Contact Person *</label>
            <input value={d.contactPerson} onChange={(e) => setD({ ...d, contactPerson: e.target.value })} />
            {errors.contactPerson && <span className="form-error">{errors.contactPerson}</span>}
          </div>
          <div className="form-field">
            <label>Contact Number *</label>
            <input value={d.contactNumber} onChange={(e) => setD({ ...d, contactNumber: e.target.value })} />
            {errors.contactNumber && <span className="form-error">{errors.contactNumber}</span>}
          </div>
        </div>
      )
    }
  ];

  const reportSteps = [
    {
      label: "Select period",
      validate: (d: ReportWizard) => validateRequired(["month", "year"], d),
      render: (d, setD, errors) => (
        <div className="wizard__grid">
          <div className="form-field">
            <label>Month *</label>
            <input value={d.month} onChange={(e) => setD({ ...d, month: e.target.value })} placeholder="e.g., November" />
            {errors.month && <span className="form-error">{errors.month}</span>}
          </div>
          <div className="form-field">
            <label>Year *</label>
            <input value={d.year} onChange={(e) => setD({ ...d, year: e.target.value })} placeholder="2025" />
            {errors.year && <span className="form-error">{errors.year}</span>}
          </div>
        </div>
      )
    },
    {
      label: "Filters",
      render: (d, setD) => (
        <div className="wizard__grid">
          <div className="form-field">
            <label>Blood Group</label>
            <select value={d.bloodGroup} onChange={(e) => setD({ ...d, bloodGroup: e.target.value })}>
              <option value="">All</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Department</label>
            <input value={d.department} onChange={(e) => setD({ ...d, department: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Case Type</label>
            <select value={d.caseType} onChange={(e) => setD({ ...d, caseType: e.target.value })}>
              <option value="">All</option>
              <option value="Routine">Routine</option>
              <option value="Emergency">Emergency</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      )
    },
    {
      label: "Summary",
      render: (d) => (
        <div className="wizard__summary">
          <p>Generating report for <strong>{d.month || "Month"} {d.year || "Year"}</strong></p>
          <ul>
            <li>Blood Group: {d.bloodGroup || "All"}</li>
            <li>Department: {d.department || "All"}</li>
            <li>Case Type: {d.caseType || "All"}</li>
          </ul>
          <p className="wizard__note">This is a preview. Click Generate Report to proceed.</p>
        </div>
      )
    }
  ];

  const trackSteps = [
    {
      label: "Identifiers",
      validate: (d: TrackWizard) => {
        if (!d.requestId && !d.patientId) {
          return { requestId: "Provide Request ID or Patient ID" };
        }
        return {};
      },
      render: (d, setD, errors) => (
        <div className="wizard__grid">
          <div className="form-field">
            <label>Request ID</label>
            <input value={d.requestId} onChange={(e) => setD({ ...d, requestId: e.target.value })} />
            {errors.requestId && <span className="form-error">{errors.requestId}</span>}
          </div>
          <div className="form-field">
            <label>Patient ID</label>
            <input value={d.patientId} onChange={(e) => setD({ ...d, patientId: e.target.value })} />
          </div>
        </div>
      )
    },
    {
      label: "Filters",
      render: (d, setD) => (
        <div className="wizard__grid">
          <div className="form-field">
            <label>Date From</label>
            <input type="date" value={d.dateFrom} onChange={(e) => setD({ ...d, dateFrom: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Date To</label>
            <input type="date" value={d.dateTo} onChange={(e) => setD({ ...d, dateTo: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select value={d.status} onChange={(e) => setD({ ...d, status: e.target.value })}>
              <option value="">All</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      )
    },
    {
      label: "Results",
      render: () => (
        <div className="wizard__summary">
          <p>Results preview (mock):</p>
          <ul>
            <li>ORD-2201 – In Progress – Updated 10:45</li>
            <li>ORD-2200 – Completed – Updated 09:20</li>
            <li>ORD-2199 – Pending – Updated 08:55</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <section className="hospital-dashboard">
      <div className="container hospital-dashboard__header">
        <div>
          <p className="pill">eBloodBank</p>
          <h1>Hospital Control Panel – eBloodBank</h1>
          <p className="hospital-dashboard__subtitle">
            Manage patients, emergency requests, monthly analytics, and live tracking from one modern control center.
          </p>
        </div>
        <div className="hospital-dashboard__badge">Hospital</div>
      </div>

      <div className="container hospital-dashboard__grid">
        <FeatureCard
          title="Add Patient"
          description="Capture patient details and link them to blood requests with guided steps."
          cta="Open Add Patient"
          image="/assets/add patient.jpg"
          imageLeft={false}
          onClick={() => setPatientOpen(true)}
        />
        <FeatureCard
          title="Emergency Blood Request"
          description="Log high-priority blood needs quickly and route them to the nearest bank."
          cta="Create Emergency Request"
          image="/assets/emergency.jpg"
          imageLeft={true}
          onClick={() => setEmergencyOpen(true)}
        />
        <FeatureCard
          title="Monthly Report"
          description="Generate monthly summaries by blood group, department, and case types."
          cta="Generate Report"
          image="/assets/monthly report.webp"
          imageLeft={false}
          onClick={() => setReportOpen(true)}
        />
        <FeatureCard
          title="Track Request Status"
          description="Search and filter past and live requests to monitor fulfillment."
          cta="Track Status"
          image="/assets/track status.webp"
          imageLeft={true}
          onClick={() => setTrackOpen(true)}
        />
      </div>

      {/* Patient Wizard */}
      <WizardModal
        isOpen={patientOpen}
        title="Add Patient"
        steps={patientSteps}
        data={patientData}
        setData={setPatientData}
        currentStep={patientStep}
        setCurrentStep={setPatientStep}
        onClose={() => {
          setPatientOpen(false);
          setPatientStep(0);
          setPatientData(initialPatient);
        }}
        onSubmit={async () => {
          await submitPatient(patientData);
          addToast("Patient added successfully");
          setPatientData(initialPatient);
        }}
        submitLabel="Save Patient"
      />

      {/* Emergency Wizard */}
      <WizardModal
        isOpen={emergencyOpen}
        title="Emergency Request"
        steps={emergencySteps}
        data={emergencyData}
        setData={setEmergencyData}
        currentStep={emergencyStep}
        setCurrentStep={setEmergencyStep}
        onClose={() => {
          setEmergencyOpen(false);
          setEmergencyStep(0);
          setEmergencyData(initialEmergency);
        }}
        onSubmit={async () => {
          await createEmergencyRequest(emergencyData);
          addToast("Emergency request submitted");
          setEmergencyData(initialEmergency);
        }}
        submitLabel="Submit Emergency"
      />

      {/* Report Wizard */}
      <WizardModal
        isOpen={reportOpen}
        title="Monthly Report"
        steps={reportSteps}
        data={reportData}
        setData={setReportData}
        currentStep={reportStep}
        setCurrentStep={setReportStep}
        onClose={() => {
          setReportOpen(false);
          setReportStep(0);
          setReportData(initialReport);
        }}
        onSubmit={async () => {
          await generateMonthlyReport(reportData);
          addToast("Monthly report generated");
          setReportData(initialReport);
        }}
        submitLabel="Generate Report"
      />

      {/* Track Wizard */}
      <WizardModal
        isOpen={trackOpen}
        title="Track Request Status"
        steps={trackSteps}
        data={trackData}
        setData={setTrackData}
        currentStep={trackStep}
        setCurrentStep={setTrackStep}
        onClose={() => {
          setTrackOpen(false);
          setTrackStep(0);
          setTrackData(initialTrack);
        }}
        onSubmit={async () => {
          await trackRequestStatus(trackData);
          addToast("Tracking results refreshed");
          setTrackData(initialTrack);
        }}
        submitLabel="Show Status"
      />
    </section>
  );
};

export default HospitalDashboard;

