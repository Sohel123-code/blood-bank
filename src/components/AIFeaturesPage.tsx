import React, { useState } from "react";
import DiseaseOutbreakPredictionModule from "./DiseaseOutbreakPredictionModule";
import BloodSpoilageModule from "./BloodSpoilageModule";

const AIFeaturesPage: React.FC = () => {
  const [activeModule, setActiveModule] = useState<"outbreak" | "spoilage">("outbreak");

  return (
    <div className="ai-features-page">
      <div className="ai-features-page__header">
        <h1>AI Features</h1>
        <p className="ai-features-page__subtitle">
          Leverage artificial intelligence for smart blood management and predictive analytics
        </p>
      </div>

      <div className="ai-features-page__tabs">
        <button
          className={`tab-button ${activeModule === "outbreak" ? "tab-button--active" : ""}`}
          onClick={() => setActiveModule("outbreak")}
        >
          Disease Outbreak Prediction
        </button>
        <button
          className={`tab-button ${activeModule === "spoilage" ? "tab-button--active" : ""}`}
          onClick={() => setActiveModule("spoilage")}
        >
          Blood Spoilage Tracker
        </button>
      </div>

      <div className="ai-features-page__content">
        {activeModule === "outbreak" && <DiseaseOutbreakPredictionModule />}
        {activeModule === "spoilage" && <BloodSpoilageModule />}
      </div>
    </div>
  );
};

export default AIFeaturesPage;

