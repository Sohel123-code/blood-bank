import React from "react";

export type ModuleCardProps = {
  title: string;
  description: string;
  cta: string;
  icon: string;
  onClick?: () => void;
  variant?: "tilt" | "float" | "stack" | "interactive";
};

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  cta,
  icon,
  onClick
}) => {
  return (
    <article className="module-card">
      <div
        className="module-card__image"
        style={{ backgroundImage: `url(${icon})` }}
        aria-hidden
      />
      <div className="module-card__content">
        <h3>{title}</h3>
        <p>{description}</p>
        <button className="btn btn-ghost module-card__btn" onClick={onClick}>
          {cta}
        </button>
      </div>
    </article>
  );
};

export default ModuleCard;

