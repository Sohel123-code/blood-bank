import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ModulesSection from "./components/ModulesSection";
import CallToActionStrip from "./components/CallToActionStrip";
import Footer from "./components/Footer";
import HospitalDashboard from "./components/HospitalDashboard";
import HospitalLoginPage from "./components/HospitalLoginPage";
import UserLoginPage from "./components/UserLoginPage";
import UserRegistrationPage from "./components/UserRegistrationPage";
import BloodAvailabilityModule from "./components/BloodAvailabilityModule";
import DonorRegistrationModule from "./components/DonorRegistrationModule";
import BloodBankLoginPage from "./components/BloodBankLoginPage";
import BloodBankDashboard from "./components/BloodBankDashboard";
import DeliveryLoginPage from "./components/DeliveryLoginPage";
import DeliveryDashboard from "./components/DeliveryDashboard";
import AIFeaturesPage from "./components/AIFeaturesPage";
import ToastProvider from "./components/ToastProvider";

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "50vh" 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="app">
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <main>
                    <HeroSection />
                    <ModulesSection />
                    <CallToActionStrip />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/hospital"
              element={
                <>
                  <HospitalDashboard />
                  <Footer />
                </>
              }
            />
            {/* Hospital Routes */}
            <Route path="/hospital/login" element={<HospitalLoginPage />} />
            <Route path="/hospital/registration" element={<HospitalDashboard />} />
            <Route path="/hospital/add-patient" element={<HospitalDashboard />} />
            <Route path="/hospital/emergency" element={<HospitalDashboard />} />
            <Route path="/hospital/tracking" element={<HospitalDashboard />} />
            <Route path="/hospital/reports" element={<HospitalDashboard />} />
            
            {/* User Authentication Routes */}
            <Route path="/user/login" element={<UserLoginPage />} />
            <Route path="/user/register" element={<UserRegistrationPage />} />
            
            {/* Protected User Routes */}
            <Route
              path="/user/availability"
              element={
                <ProtectedRoute>
                  <BloodAvailabilityModule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/donor-registration"
              element={
                <ProtectedRoute>
                  <DonorRegistrationModule />
                </ProtectedRoute>
              }
            />
            
            {/* Blood Bank Routes */}
            <Route path="/blood-bank/login" element={<BloodBankLoginPage />} />
            <Route path="/blood-bank/dashboard" element={<BloodBankDashboard />} />
            
            {/* Delivery Routes */}
            <Route path="/delivery/login" element={<DeliveryLoginPage />} />
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
            
            {/* AI Features */}
            <Route path="/ai-features" element={<AIFeaturesPage />} />
          </Routes>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
