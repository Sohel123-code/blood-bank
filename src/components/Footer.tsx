import React from "react";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="footer">
      <div className="container footer__content">
        <div>
          <p className="footer__brand">Blood Connect © {year} – E-Blood Bank System</p>
          <p className="footer__text">Contact: support@bloodconnect.health</p>
        </div>
        <div className="footer__links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#help">Help</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

