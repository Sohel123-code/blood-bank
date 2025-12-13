// TypeScript interfaces for Hospital Module data models

export interface Patient {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  ward: string;
  bedNumber: string;
  diagnosis: string;
  bloodGroup: string;
  doctorInCharge: string;
  admissionDate: string;
  priorityLevel: "Normal" | "Urgent" | "Critical";
}

export interface TrackingOrder {
  orderId: string;
  patientName: string;
  bloodGroup: string;
  units: number;
  status: "Completed" | "In Progress" | "Pending" | "Cancelled";
  requestedAt: string;
  lastUpdated: string;
}

export interface MonthlyReportRow {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  diagnosis: string;
  caseType: "Routine" | "Emergency" | "Critical";
  bloodGroup: string;
  unitsUsed: number;
  admissionDate: string;
  dischargeDate: string;
  outcome: "Recovered" | "Under Treatment" | "Referred";
}

export interface HospitalRegistration {
  hospitalName: string;
  hospitalId: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPersonName: string;
  contactNumber: string;
  email: string;
  hospitalType: "Government" | "Private" | "Trust" | "Other";
  bedCapacity: number;
  hasBloodStorage: boolean;
}

export interface EmergencyRequest {
  emergencyCaseId: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  neededWithin: string;
  emergencyType: "Accident" | "Surgery" | "ICU" | "Other";
  location: string;
  contactPerson: string;
  contactNumber: string;
  additionalNotes: string;
  status: string;
}

