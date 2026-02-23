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
          <img src={assets.logo} alt="" />
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. 
            Tenetur fugiat, odio adipisci rerum dicta non ullam corporis, 
            iure ea doloremque quisquam pariatur tempora facilis, 
            assumenda dolorem voluptatum tempore deleniti quo!
          </p>{" "}
          <div className="footer-social-icons">
            {/* 🟢 Facebook Icon (Replace with your actual Facebook URL) */}
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={assets.facebook_icon} alt="Facebook" />
            </a>

            {/* 🟢 Instagram Icon (Replace with your actual Instagram URL) */}
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={assets.instagram_icon} alt="Instagram" />
            </a>
          </div>
        </div>

        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/privacy">Privacy policy</Link></li>
          </ul>
        </div>

        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li><a href="tel:+4712345">+47 123 45 789</a></li>
            <li><a href="mailto:resto@gmail.com">restauran@email.com</a></li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2025 © All Right Reserved
      </p>
    </div>
  );
};

export default Footer;
