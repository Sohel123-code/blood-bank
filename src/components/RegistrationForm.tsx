import React, { useState } from "react";
import { HospitalRegistration } from "../types/hospital";

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<HospitalRegistration>({
    hospitalName: "",
    hospitalId: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    contactPersonName: "",
    contactNumber: "",
    email: "",
    hospitalType: "Government",
    bedCapacity: 0,
    hasBloodStorage: false
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Hospital Registration Submitted:", formData);
    alert("Registration form submitted! (This is a demo - no data was saved)");
  };

  return (
    <div className="hospital-form">
      <h3 className="hospital-form__title">Hospital Registration Form</h3>
      <form onSubmit={handleSubmit} className="hospital-form__form">
        <div className="hospital-form__row">
          <div className="hospital-form__field">
            <label htmlFor="hospitalName">Hospital Name *</label>
            <input
              type="text"
              id="hospitalName"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="hospital-form__field">
            <label htmlFor="hospitalId">Hospital ID *</label>
            <input
              type="text"
              id="hospitalId"
              name="hospitalId"
              value={formData.hospitalId}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="hospital-form__field">
          <label htmlFor="address">Address *</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>

        <div className="hospital-form__row">
          <div className="hospital-form__field">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="hospital-form__field">
            <label htmlFor="state">State *</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </div>
          <div className="hospital-form__field">
            <label htmlFor="pincode">Pincode *</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="hospital-form__row">
          <div className="hospital-form__field">
            <label htmlFor="contactPersonName">Contact Person Name *</label>
            <input
              type="text"
              id="contactPersonName"
              name="contactPersonName"
              value={formData.contactPersonName}
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
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="hospital-form__row">
          <div className="hospital-form__field">
            <label htmlFor="hospitalType">Hospital Type *</label>
            <select
              id="hospitalType"
              name="hospitalType"
              value={formData.hospitalType}
              onChange={handleChange}
              required
            >
              <option value="Government">Government</option>
              <option value="Private">Private</option>
              <option value="Trust">Trust</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="hospital-form__field">
            <label htmlFor="bedCapacity">Bed Capacity *</label>
            <input
              type="number"
              id="bedCapacity"
              name="bedCapacity"
              value={formData.bedCapacity}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="hospital-form__field">
          <label className="hospital-form__checkbox">
            <input
              type="checkbox"
              name="hasBloodStorage"
              checked={formData.hasBloodStorage}
              onChange={handleChange}
            />
            <span>Available Blood Storage?</span>
          </label>
        </div>

        <button type="submit" className="btn btn-primary hospital-form__submit">
          Submit Registration
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;

