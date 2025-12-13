import React, { useState } from "react";
import { EmergencyRequest } from "../types/hospital";

const EmergencyRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<Omit<EmergencyRequest, "emergencyCaseId" | "status">>({
    patientName: "",
    bloodGroup: "",
    unitsRequired: 0,
    neededWithin: "",
    emergencyType: "Accident",
    location: "",
    contactPerson: "",
    contactNumber: "",
    additionalNotes: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "unitsRequired" ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emergencyData: EmergencyRequest = {
      ...formData,
      emergencyCaseId: `EMG-${Date.now()}`,
      status: "Pending – High Priority"
    };
    console.log("Emergency Request Submitted:", emergencyData);
    alert("Emergency request submitted! (This is a demo - no data was saved)");
  };

  return (
    <div className="hospital-form">
      <h3 className="hospital-form__title">Emergency Request Form</h3>
      <form onSubmit={handleSubmit} className="hospital-form__form">
        <div className="hospital-form__row">
          <div className="hospital-form__field">
            <label htmlFor="patientName">Patient Name *</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="hospital-form__field">
            <label htmlFor="bloodGroup">Blood Group *</label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div className="hospital-form__row">
          <div className="hospital-form__field">
            <label htmlFor="unitsRequired">Units Required *</label>
            <input
              type="number"
              id="unitsRequired"
              name="unitsRequired"
              value={formData.unitsRequired}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          <div className="hospital-form__field">
            <label htmlFor="neededWithin">Needed Within *</label>
            <input
              type="text"
              id="neededWithin"
              name="neededWithin"
              value={formData.neededWithin}
              onChange={handleChange}
              placeholder="e.g., Within 2 hours"
              required
            />
          </div>
        </div>

        <div className="hospital-form__row">
          <div className="hospital-form__field">
            <label htmlFor="emergencyType">Emergency Type *</label>
            <select
              id="emergencyType"
              name="emergencyType"
              value={formData.emergencyType}
              onChange={handleChange}
              required
            >
              <option value="Accident">Accident</option>
              <option value="Surgery">Surgery</option>
              <option value="ICU">ICU</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="hospital-form__field">
            <label htmlFor="location">Ward / OT / Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="hospital-form__row">
          <div className="hospital-form__field">
            <label htmlFor="contactPerson">Contact Person *</label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              required
            />
          </div>
          <div className="hospital-form__field">
            <label htmlFor="contactNumber">Contact Number *</label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="hospital-form__field">
          <label htmlFor="additionalNotes">Additional Notes</label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            rows={4}
            placeholder="Any additional information about the emergency..."
          />
        </div>

        <div className="hospital-form__field">
          <label htmlFor="status">Status</label>
          <input
            type="text"
            id="status"
            name="status"
            value="Pending – High Priority"
            readOnly
            className="hospital-form__readonly"
          />
        </div>

        <button type="submit" className="btn btn-primary hospital-form__submit">
          Submit Emergency Request
        </button>
      </form>
    </div>
  );
};

export default EmergencyRequestForm;

