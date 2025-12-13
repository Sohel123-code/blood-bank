// Mock API layer to simulate future backend integration
export const submitPatient = async (data: unknown) => {
  console.log("Submitting patient", data);
  return new Promise((resolve) => setTimeout(resolve, 400));
};

export const createEmergencyRequest = async (data: unknown) => {
  console.log("Creating emergency request", data);
  return new Promise((resolve) => setTimeout(resolve, 400));
};

export const generateMonthlyReport = async (data: unknown) => {
  console.log("Generating monthly report", data);
  return new Promise((resolve) => setTimeout(resolve, 400));
};

export const trackRequestStatus = async (data: unknown) => {
  console.log("Tracking request status", data);
  return new Promise((resolve) => setTimeout(resolve, 400));
};

