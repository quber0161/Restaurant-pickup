/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./GuestTrack.css";

const GuestTrack = () => {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "Order Processing":
        return "#f8d7da";
      case "Ready to Takeaway":
        return "#fff3cd";
      case "Taken":
        return "#d4edda";
      default:
        return "#f8f9fa";
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/order/track/${token}`);
        if (res.data.success) {
          setOrder(res.data.order);
        } else {
          alert(res.data.message || "Order not found.");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        alert("An error occurred while fetching the order.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [token]);

  if (loading) return <div className="guest-track"><h3>Loading...</h3></div>;
  if (!order) return <div className="guest-track"><h3>No order found.</h3></div>;

  return (
    <div className="guest-track">
      <h2>Guest Order Tracking</h2>
      <div
        className="guest-order"
        style={{ backgroundColor: getStatusBackgroundColor(order.status) }}
      >
        <div className="order-details">
          {order.items.map((item, idx) => (
            <div key={idx} className="order-item">
              <p>
                <b>{item.name}</b> x {item.quantity}
              </p>

              {item.mandatoryOptions && Object.keys(item.mandatoryOptions).length > 0 && (
                <p className="order-mandatory">
                  <b>Options:</b>{" "}
                  {Object.entries(item.mandatoryOptions).map(([key, value], i, arr) => (
                    <span className="mandatory" key={i}>
                      {key}: {value.label}
                      {value.additionalPrice ? ` (+Kr ${value.additionalPrice})` : ""}
                      {i < arr.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              )}

              {item.extras?.length > 0 && (
                <p className="order-extras">
                  <b>Extras:</b>{" "}
                  {item.extras.map((extra, i) => (
                    <span className="ex" key={i}>
                      {extra.name} x {extra.quantity || 1}
                      {i < item.extras.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              )}

              {item.comment && (
                <p className="order-comment">
                  <b>Note:</b> {item.comment}
                </p>
              )}
            </div>
          ))}
        </div>

        <p><b>Total:</b> Kr {order.amount}.00</p>
        <p><b>Items:</b> {order.items.length}</p>
        <p>
          <span>&#x25cf;</span>{" "}
          <span className="status-pill">{order.status}</span>
        </p>

        <button className="gu-bt" onClick={() => window.location.reload()}>Track Order</button>
      </div>
    </div>
  );
};

export default GuestTrack;
