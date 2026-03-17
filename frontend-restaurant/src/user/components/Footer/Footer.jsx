/* eslint-disable no-unused-vars */
import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <div className="footer-brand">
            <img className="footer-logo" src={assets.logo} alt="BirdieBite" />
            <div className="footer-brand-text">
              <div className="footer-brand-name">BirdieBite</div>
              <div className="footer-brand-tagline">Modern pickup & delivery</div>
            </div>
          </div>
          <p className="footer-desc">
            Order from your favorite spot in a few taps. Fresh food, fast pickup, and clear order tracking—no fuss.
          </p>
          <div className="footer-social-icons">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <img src={assets.facebook_icon} alt="Facebook" />
            </a>

            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <img src={assets.instagram_icon} alt="Instagram" />
            </a>
          </div>
        </div>

        <div className="footer-content-center">
          <h2>Explore</h2>
          <ul>
            <li>
              <Link to="/" className="footer-birdiebite-link">← Return to BirdieBite</Link>
            </li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/privacy">Privacy policy</Link></li>
          </ul>
        </div>

        <div className="footer-content-right">
          <h2>Contact</h2>
          <ul>
            <li><a href="tel:+4712345">+47 123 45 789</a></li>
            <li><a href="mailto:resto@gmail.com">restauran@email.com</a></li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        © {new Date().getFullYear()} BirdieBite. All rights reserved.
      </p>
    </div>
  );
};

export default Footer;
