import React from "react";

type HospitalFeatureCardProps = {
  title: string;
  description: string;
  cta: string;
  image: string;
  onClick?: () => void;
};

const HospitalFeatureCard: React.FC<HospitalFeatureCardProps> = ({
  title,
  description,
  cta,
  image,
  onClick
}) => {
  return (
    <article className="hospital-card">
      <div className="hospital-card__image" style={{ backgroundImage: `url(${image})` }} />
      <div className="hospital-card__body">
        <h3>{title}</h3>
        <p>{description}</p>
        <button className="btn btn-primary hospital-card__btn" onClick={onClick}>
          {cta}
        </button>
      </div>
    </article>
  );
};

export default HospitalFeatureCard;

