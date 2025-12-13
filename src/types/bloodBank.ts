export type BloodGroupKey = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type BloodBank = {
  id: string;
  name: string;
  state: string;
  district: string;
  address: string;
  contact: string;
  bloodGroups: Record<BloodGroupKey, number>;
};

