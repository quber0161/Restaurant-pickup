/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import "./BirdieBiteLanding.css";
const DEFAULT_RESTAURANTS = [
  { _id: "1", name: "Restoran", slug: "restoran", rating: 4.8, deliveryTime: "To your hole in 25 min", image: "/img/about-1.jpg" },
  { _id: "2", name: "Joe's Grill", slug: "joes-grill", rating: 4.7, deliveryTime: "To your hole in 20 min", image: "/img/about-2.jpg" },
  { _id: "3", name: "Bella Italiana", slug: "bella-italiana", rating: 4.9, deliveryTime: "To your hole in 18 min", image: "/img/about-3.jpg" },
  { _id: "4", name: "Sunrise Cafe", slug: "sunrise-cafe", rating: 4.6, deliveryTime: "To your hole in 22 min", image: "/img/about-4.jpg" },
];

const BirdieBiteLanding = ({ setShowLogin }) => {
  const { url, token, userRole } = useContext(StoreContext);
  const [restaurants, setRestaurants] = useState(DEFAULT_RESTAURANTS);

  useEffect(() => {
    if (!url) return;
    axios.get(`${url}/api/birdiebite/restaurants/list`).then((res) => {
      if (res.data.success && res.data.restaurants?.length > 0) {
        setRestaurants(res.data.restaurants);
      }
    }).catch(() => {});
  }, [url]);

  return (
    <div className="birdiebite">
      {/* Header */}
      <header className="birdiebite-header">
        <div className="birdiebite-header-inner">
          <Link to="/" className="birdiebite-logo">
            <span className="logo-icon">⛳</span>
            <span className="logo-text">BirdieBite</span>
          </Link>
          <nav className="birdiebite-nav">
            <a href="#how-it-works">How it works</a>
            <a href="#restaurants">Restaurants</a>
            <a href="#footer">Contact</a>
          </nav>
          <div className="birdiebite-header-cta">
            <button
              className="birdiebite-login-btn"
              onClick={() => setShowLogin?.(true)}
              aria-label="Sign in"
            >
              <img src={assets.profile_icon} alt="" />
              <span>Sign in</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="birdiebite-hero">
        <div className="hero-content">
          <p className="hero-tagline">Food delivered to the course</p>
          <h1 className="hero-title">
            Stay on the green.<br />We&apos;ll bring the food.
          </h1>
          <p className="hero-subtitle">
            Order from the clubhouse while you play. BirdieBite delivers directly to your hole — no more missing a putt to grab lunch. 
            Pick your course, order your food, keep your round going.
          </p>
          <div className="hero-search">
            <input
              type="text"
              placeholder="Find food at your golf course..."
              className="hero-search-input"
              readOnly
            />
            <button className="hero-search-btn">Order to my hole</button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">47</span>
            <span className="stat-label">Courses served</span>
          </div>
          <div className="stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">Deliveries today</span>
          </div>
          <div className="stat">
            <span className="stat-number">25 min</span>
            <span className="stat-label">Avg. delivery time</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="birdiebite-how">
        <h2 className="section-title">How it works</h2>
        <div className="how-grid">
          <div className="how-step">
            <span className="how-number">1</span>
            <h3>Pick your course</h3>
            <p>Choose from restaurants at golf courses near you</p>
          </div>
          <div className="how-step">
            <span className="how-number">2</span>
            <h3>Order on the app</h3>
            <p>Select your hole & time — we&apos;ll know when to deliver</p>
          </div>
          <div className="how-step">
            <span className="how-number">3</span>
            <h3>Get it at the green</h3>
            <p>Food arrives at your hole. No round interrupted.</p>
          </div>
        </div>
      </section>

      {/* Restaurants */}
      <section id="restaurants" className="birdiebite-restaurants">
        <h2 className="section-title">Restaurants nearest your course</h2>
        <p className="section-desc">
          Order from restaurants closest to your course. Food delivered straight to your hole so you never have to leave the green.
        </p>
        <div className="restaurants-grid">
          {restaurants.length === 0 ? (
            <p className="restaurants-empty">No restaurants yet. Superadmin can add restaurants.</p>
          ) : (
            restaurants.map((restaurant) => (
              <div key={restaurant._id} className="restaurant-card-wrap">
                <Link
                  to={restaurant.slug ? `/menu/${restaurant.slug}` : "/menu"}
                  className="restaurant-card"
                >
                  <div className="restaurant-image-wrap">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="restaurant-image"
                    />
                    <span className="restaurant-rating">★ {restaurant.rating}</span>
                  </div>
                  <div className="restaurant-info">
                    <h3 className="restaurant-name">{restaurant.name}</h3>
                    <p className="restaurant-time">{restaurant.deliveryTime}</p>
                  </div>
                </Link>
                {token && userRole === "admin" && restaurant.slug && (
                  <Link to={`/admin/${restaurant.slug}/orders`} className="restaurant-manage-link">Manage</Link>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="birdiebite-cta">
        <h2>No more skipping holes for lunch</h2>
        <p>Order food to your hole. Keep your round going. Download the app or order online.</p>
        <div className="cta-buttons">
          <a href="#" className="cta-btn">App Store</a>
          <a href="#" className="cta-btn">Google Play</a>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="birdiebite-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-icon">⛳</span>
            <span className="logo-text">BirdieBite</span>
          </div>
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Contact</h4>
              <p>+47 123 45 678</p>
              <p>+47 876 54 321</p>
              <p>hello@birdiebite.no</p>
            </div>
            <div className="footer-col">
              <h4>Courses</h4>
              <p>+47 courses across Norway</p>
              <p>Partner courses welcome</p>
            </div>
            <div className="footer-col">
              <h4>Hours</h4>
              <p>Mon–Fri: 10:00 – 22:00</p>
              <p>Sat–Sun: 11:00 – 23:00</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 BirdieBite. Food delivered to the course. Stay on the green.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BirdieBiteLanding;
