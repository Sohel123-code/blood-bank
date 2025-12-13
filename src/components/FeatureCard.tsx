import React from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  cta: string;
  image: string;
  imageLeft?: boolean;
  onClick: () => void;
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  cta,
  image,
  imageLeft = false,
  onClick
}) => {
  return (
    <article className="feature-card">
      <div className={`feature-card__grid ${imageLeft ? "feature-card__grid--image-left" : ""}`}>
        {imageLeft && (
          <div className="feature-card__image">
            <img src={image} alt={title} loading="lazy" />
          </div>
        )}
        <div className="feature-card__content">
          <h3>{title}</h3>
          <p>{description}</p>
          <button className="btn btn-primary" onClick={onClick}>
            {cta}
          </button>
        </div>
        {!imageLeft && (
          <div className="feature-card__image">
            <img src={image} alt={title} loading="lazy" />
          </div>
        )}
      </div>
    </article>
  );
};

export default FeatureCard;

