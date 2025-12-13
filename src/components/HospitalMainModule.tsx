import React, { useState } from "react";
import HospitalSection from "./HospitalSection";
import RegistrationForm from "./RegistrationForm";
import AddPatientForm from "./AddPatientForm";
import EmergencyRequestForm from "./EmergencyRequestForm";
import TrackingStatusTable from "./TrackingStatusTable";
import MonthlyReportTable from "./MonthlyReportTable";

const HospitalMainModule: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionName: string) => {
    setExpandedSection((prev) => (prev === sectionName ? null : sectionName));
  };

  return (
    <section className="hospital-module">
      <div className="hospital-module__hero">
        <div
          className="hospital-module__hero-bg"
          style={{ backgroundImage: "url(/assets/h1.jpg)" }}
        />
        <div className="hospital-module__hero-overlay" />
        <div className="container hospital-module__hero-content">
          <div>
            <p className="pill">Hospital Main Module</p>
            <h1>Manage hospital registrations, patients, emergencies, and reports in one place.</h1>
            <p className="hospital-module__hero-sub">
              Stay coordinated with real-time requests, emergency routing, and monthly insights —
              all with Blood Connect.
            </p>
          </div>
        </div>
      </div>

      <div className="container hospital-module__sections">
        {/* Section 1: Registration - TEXT LEFT, IMAGE RIGHT */}
        <HospitalSection
          title="Hospital Registration"
          description="Register your hospital, manage your blood requests, and stay connected with nearby blood banks to streamline operations and save lives faster."
          buttonText="Open Registration"
          image="/assets/h1.jpg"
          imageLeft={false}
          isExpanded={expandedSection === "registration"}
          onToggle={() => toggleSection("registration")}
        >
          <RegistrationForm />
        </HospitalSection>

        {/* Section 2: Add Patient - IMAGE LEFT, TEXT RIGHT */}
        {/* Image: Person donating blood with heart stress ball - represents patient care */}
        <HospitalSection
          title="Add Patient"
          description="Add patient details and link them to blood requests for quick tracking, ensuring timely care and efficient resource management."
          buttonText="Add Patient"
          image="/assets/i1.jpg"
          imageLeft={true}
          isExpanded={expandedSection === "add-patient"}
          onToggle={() => toggleSection("add-patient")}
        >
          <AddPatientForm />
        </HospitalSection>

        {/* Section 3: Emergency Request - TEXT LEFT, IMAGE RIGHT */}
        {/* Image: Blood bag with label - represents urgent blood needs */}
        <HospitalSection
          title="Emergency Request"
          description="Create high-priority blood requests for critical and accident cases. Get immediate attention for urgent medical situations requiring rapid blood supply."
          buttonText="Create Emergency Request"
          image="/assets/blood.jpg"
          imageLeft={false}
          isExpanded={expandedSection === "emergency"}
          onToggle={() => toggleSection("emergency")}
        >
          <EmergencyRequestForm />
        </HospitalSection>

        {/* Section 4: Tracking Status - IMAGE LEFT, TEXT RIGHT */}
        {/* Image: Hands handling blood bags in wire rack - represents tracking and inventory */}
        <HospitalSection
          title="Tracking Status"
          description="Track the live status of your hospital's blood requests and responses. Monitor order progress, fulfillment, and delivery timelines in real-time."
          buttonText="View Tracking Status"
          image="/assets/i2.jpg"
          imageLeft={true}
          isExpanded={expandedSection === "tracking"}
          onToggle={() => toggleSection("tracking")}
        >
          <TrackingStatusTable />
        </HospitalSection>

        {/* Section 5: Report of the Month - TEXT LEFT, IMAGE RIGHT */}
        {/* Image: Monthly report document with charts - represents analytics and reporting */}
        <HospitalSection
          title="Report of the Month"
          description="View monthly analytics of blood requests, fulfilled units, and donor statistics. Gain insights into patient outcomes, usage patterns, and operational efficiency."
          buttonText="View Monthly Report"
          image="/assets/i3.jpg"
          imageLeft={false}
          isExpanded={expandedSection === "monthly-report"}
          onToggle={() => toggleSection("monthly-report")}
        >
          <MonthlyReportTable />
        </HospitalSection>
      </div>
    </section>
  );
};

export default HospitalMainModule;
