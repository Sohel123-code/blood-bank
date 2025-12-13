import React from "react";
import ModuleCard, { ModuleCardProps } from "./ModuleCard";
import { useNavigate } from "react-router-dom";
import aiImage from "../images/AI.jpeg";

const ModulesSection: React.FC = () => {
  const navigate = useNavigate();
  const modules: ModuleCardProps[] = [
    {
      title: "HOSPITAL LOGIN",
      description: "Register your hospital, manage blood requests, and update live availability with ease.",
      cta: "Login",
      icon: "/assets/h1.jpg",
      variant: "tilt",
      onClick: () => navigate("/hospital/login")
    },
    {
      title: "User Login",
      description: "Donors and patients can log in, search blood inventory, and track their requests.",
      cta: "User Login",
      icon: "/assets/user.png",
      variant: "float",
      onClick: () => navigate("/user/login")
    },
    {
      title: "Blood Bank Login",
      description: "Manage stock, approve requests, and generate reports across partnered banks.",
      cta: "Blood Bank Access",
      icon: "/assets/blood.jpg",
      variant: "stack",
      onClick: () => navigate("/blood-bank/login")
    },
    {
      title: "Delivery Portal",
      description: "Delivery personnel can view accepted requests, track deliveries, and navigate using interactive maps.",
      cta: "Delivery Login",
      icon: "/assets/delivery.webp",
      variant: "interactive",
      onClick: () => navigate("/delivery/login")
    },
    {
      title: "AI Features",
      description: "Leverage artificial intelligence for smart blood matching, predictive analytics, and automated donor recommendations.",
      cta: "Explore AI",
      icon: aiImage,
      variant: "tilt",
      onClick: () => navigate("/ai-features")
    }
  ];

  return (
    <section id="services" className="modules fade-up">
      <div className="container">
        <div className="modules__header">
          <p className="pill">Smart routing</p>
          <h2>Connect to the Right Place Instantly</h2>
          <p className="modules__subtitle">
            Pick the right portal for your role to request, supply, or donate blood with zero friction.
          </p>
        </div>
        <div className="modules__grid">
          {modules.map((module) => (
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;

