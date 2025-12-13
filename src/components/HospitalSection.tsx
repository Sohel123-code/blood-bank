import React, { ReactNode } from "react";

type HospitalSectionProps = {
  title: string;
  description: string;
  buttonText: string;
  image: string;
  imageLeft: boolean; // true = image on left, false = image on right
  children?: ReactNode; // Slide-down panel content
  isExpanded: boolean;
  onToggle: () => void;
};

const HospitalSection: React.FC<HospitalSectionProps> = ({
  title,
  description,
  buttonText,
  image,
  imageLeft,
  children,
  isExpanded,
  onToggle
}) => {
  const textContent = (
    <div className="hospital-section__text">
      <h2 className="hospital-section__title">{title}</h2>
      <p className="hospital-section__description">{description}</p>
      <button className="btn btn-primary hospital-section__btn" onClick={onToggle}>
        {buttonText}
      </button>
    </div>
  );

  const imageContent = (
    <div className="hospital-section__image">
      <img src={image} alt={title} />
    </div>
  );

  return (
    <div className="hospital-section">
      <div className={`hospital-section__row ${imageLeft ? "image-left" : "image-right"}`}>
        {imageLeft ? (
          <>
            {imageContent}
            {textContent}
          </>
        ) : (
          <>
            {textContent}
            {imageContent}
          </>
        )}
      </div>
      <div className={`hospital-section__panel ${isExpanded ? "expanded" : ""}`}>
        {isExpanded && <div className="hospital-section__panel-content">{children}</div>}
      </div>
    </div>
  );
};

export default HospitalSection;

