import React from "react";

const CallToActionStrip: React.FC = () => {
  return (
    <section id="about" className="cta-strip">
      <div className="container cta-strip__content">
        <div>
          <p className="pill">Act now</p>
          <h3>Donate Blood, Save Lives – Your One Pint Can Be Someone’s Second Chance.</h3>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            // TODO: Navigate to donor registration
            console.log("TODO: Navigate to /donor/register");
          }}
        >
          Register as Donor
        </button>
      </div>
    </section>
  );
};

export default CallToActionStrip;

