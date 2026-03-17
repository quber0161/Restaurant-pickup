/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./GuestTrack.css";

const GuestTrack = () => {
  const { token } = useParams();
  const { setRestaurantSlug, restaurantSlug } = useContext(StoreContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://restaurant-pickup-1.onrender.com";

  const fetchOrder = useCallback(async () => {
    if (!token) {
      setError("Invalid tracking link");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiUrl}/api/order/track/${token}`);
      if (res.data.success) {
        const ord = res.data.order;
        setOrder(ord);
        if (ord?.restaurantId?.slug) setRestaurantSlug(ord.restaurantId.slug);
      } else {
        setError(res.data.message || "Order not found.");
      }
    } catch (err) {
      setError("Could not load order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token, apiUrl]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const STATUS_FLOW = [
    { key: "Order Processing", label: "Preparing your order", icon: "📦" },
    { key: "Ready to Takeaway", label: "Ready for pickup", icon: "✅" },
    { key: "Taken", label: "Collected", icon: "🎉" },
  ];

  const getStatusIndex = () => {
    const idx = STATUS_FLOW.findIndex((s) => s.key === (order?.status || "Order Processing"));
    return idx >= 0 ? idx : 0;
  };

  const getEstimatedTime = () => {
    const status = order?.status || "Order Processing";
    const deliveryTime = order?.restaurantId?.deliveryTime;
    if (status === "Ready to Takeaway") return "Ready now!";
    if (status === "Taken") return "Order collected";
    return deliveryTime || "~15–25 min";
  };

  const formatAddress = () => {
    const a = order?.address;
    if (!a) return "";
    const parts = [a.houseNo, a.street, a.zipCode].filter(Boolean);
    return parts.join(", ");
  };

  const getMapsUrl = () => {
    const addr = formatAddress();
    if (!addr) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
  };

  const effectiveSlug = restaurantSlug || order?.restaurantId?.slug || null;
  const menuPath = effectiveSlug ? `/menu/${effectiveSlug}` : "/menu";

  if (loading && !order) return (
    <div className="guest-track">
      <Link to={menuPath} className="guest-track-back">← Return to menu</Link>
      <div className="track-loading">
        <div className="track-spinner"></div>
        <p>Loading your order...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="guest-track">
      <Link to={menuPath} className="guest-track-back">← Return to menu</Link>
      <div className="track-error">
        <span className="track-error-icon">❌</span>
        <h3>{error}</h3>
        <Link to={menuPath} className="track-error-link">Back to menu</Link>
      </div>
    </div>
  );

  if (!order) return (
    <div className="guest-track">
      <Link to={menuPath} className="guest-track-back">← Return to menu</Link>
      <div className="track-error">
        <h3>No order found.</h3>
        <Link to={menuPath} className="track-error-link">Back to menu</Link>
      </div>
    </div>
  );

  const statusIndex = getStatusIndex();
  const mapsUrl = getMapsUrl();

  return (
    <div className="guest-track">
      <Link to={menuPath} className="guest-track-back">← Return to menu</Link>

      <header className="track-header">
        <h1>Track your order</h1>
        <p className="track-restaurant">{order.restaurantId?.name || "Restaurant"}</p>
      </header>

      {/* Estimated time */}
      <div className="track-eta">
        <span className="track-eta-icon">⏱</span>
        <div>
          <span className="track-eta-label">Estimated time</span>
          <span className="track-eta-value">{getEstimatedTime()}</span>
        </div>
      </div>

      {/* Map card */}
      {formatAddress() && (
        <div className="track-map-card">
          <div className="track-map-visual">
            <div className="track-map-pin">📍</div>
            <div className="track-map-pattern"></div>
          </div>
          <div className="track-map-info">
            <p className="track-map-label">Pickup address</p>
            <p className="track-map-address">{formatAddress()}</p>
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="track-map-directions">
                Get directions
              </a>
            )}
          </div>
        </div>
      )}

      {/* Status stepper */}
      <div className="track-stepper">
        {STATUS_FLOW.map((step, i) => (
          <div key={step.key} className={`track-step ${i <= statusIndex ? "active" : ""} ${i < statusIndex ? "done" : ""}`}>
            <div className="track-step-dot">
              {i < statusIndex ? "✓" : step.icon}
            </div>
            <span className="track-step-label">{step.label}</span>
            {i < STATUS_FLOW.length - 1 && <div className="track-step-line" />}
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="track-order-card">
        <h3>Order summary</h3>
        <ul className="track-items">
          {(order.items || []).map((item, idx) => (
            <li key={idx} className="track-item">
              <span className="track-item-name">
                {item.name} × {item.quantity}
              </span>
              {(item.mandatoryOptions && Object.keys(item.mandatoryOptions).length > 0) && (
                <span className="track-item-options">
                  {Object.entries(item.mandatoryOptions).map(([k, v]) => v.label).join(", ")}
                </span>
              )}
              {(item.extras?.length > 0) && (
                <span className="track-item-extras">
                  + {item.extras.map((e) => `${e.name} × ${e.quantity || 1}`).join(", ")}
                </span>
              )}
              {item.comment && <span className="track-item-note">Note: {item.comment}</span>}
            </li>
          ))}
        </ul>
        <div className="track-total">
          <span>Total</span>
          <span>Kr {(order.amount || 0).toFixed(2)}</span>
        </div>
      </div>

      <button className="track-refresh" onClick={fetchOrder} disabled={loading}>
        {loading ? "Refreshing…" : "Refresh status"}
      </button>
    </div>
  );
};

export default GuestTrack;
