import React from "react";

const heroVideo = "/assets/intro.mp4";

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="hero hero--video">
      <div className="video-container">
        <video className="video" autoPlay muted loop playsInline>
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="video-overlay" />
      </div>
      <div className="container hero__content hero__content--on-video">
        <div className="hero__text">
          <p className="pill">Trusted digital blood network</p>
          <h1>Every Drop Counts.</h1>
          <p className="hero__subtitle">
            Blood Connect unites hospitals, donors, and blood banks in one smart platform.
          </p>
          <div className="hero__actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                // TODO: Navigate to onboarding
                console.log("TODO: Navigate to onboarding");
              }}
            >
              Get Started
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                // TODO: Open learn more section
                console.log("TODO: Navigate to learn more");
              }}
            >
              Learn More
            </button>
          </div>
        </div>
        <div className="hero__stats">
          <div className="stat-card">
            <span className="stat-card__value">24/7</span>
            <span className="stat-card__label">Emergency Ready</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">10k+</span>
            <span className="stat-card__label">Active Donors</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">180+</span>
            <span className="stat-card__label">Partner Hospitals</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

