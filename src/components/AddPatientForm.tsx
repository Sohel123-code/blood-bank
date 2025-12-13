import React, { useState } from "react";
import { Patient } from "../types/hospital";

const AddPatientForm: React.FC = () => {
  const [formData, setFormData] = useState<Omit<Patient, "patientId">>({
    patientName: "",
    age: 0,
    gender: "",
    ward: "",
    bedNumber: "",
    diagnosis: "",
    bloodGroup: "",
    doctorInCharge: "",
    admissionDate: "",
    priorityLevel: "Normal"
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientData: Patient = {
      ...formData,
      patientId: `PAT-${Date.now()}`
    };
    console.log("Patient Added:", patientData);
    alert("Patient details saved! (This is a demo - no data was saved)");
  };

  return (
    <div className="hospital-form">
      <h3 className="hospital-form__title">Add Patient Details</h3>
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
            <label htmlFor="age">Age *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="0"
              max="150"
              required
            />
          </div>
          <div className="hospital-form__field">
            <label htmlFor="gender">Gender *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="hospital-form__row">
          <div className="hospital-form__field">
            <label htmlFor="ward">Ward/Department *</label>
            <input
              type="text"
              id="ward"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              required
            />
          </div>
          <div className="hospital-form__field">
            <label htmlFor="bedNumber">Bed Number *</label>
            <input
              type="text"
              id="bedNumber"
              name="bedNumber"
              value={formData.bedNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="hospital-form__field">
          <label htmlFor="diagnosis">Disease / Diagnosis *</label>
          <textarea
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>

        <div className="hospital-form__row">
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
          <div className="hospital-form__field">
            <label htmlFor="doctorInCharge">Doctor In Charge *</label>
            <input
              type="text"
              id="doctorInCharge"
              name="doctorInCharge"
              value={formData.doctorInCharge}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="hospital-form__row">
          <div className="hospital-form__field">
            <label htmlFor="admissionDate">Admission Date *</label>
            <input
              type="date"
              id="admissionDate"
              name="admissionDate"
              value={formData.admissionDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="hospital-form__field">
            <label htmlFor="priorityLevel">Priority Level *</label>
            <select
              id="priorityLevel"
              name="priorityLevel"
              value={formData.priorityLevel}
              onChange={handleChange}
              required
            >
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary hospital-form__submit">
          Save Patient
        </button>
      </form>
    </div>
  );
};

export default AddPatientForm;

