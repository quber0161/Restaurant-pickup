/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./Orders.css";
import axios from "axios";
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import notifySound from "../../assets/notify.wav";

// Status flow: Order Processing → Accepted → On its way → Taken (Finished)
const STATUS_FLOW = [
  { key: "Order Processing", label: "Accept", next: "Accepted" },
  { key: "Accepted", label: "On its way", next: "On its way" },
  { key: "Ready to Takeaway", label: "On its way", next: "On its way" }, // backwards compat
  { key: "On its way", label: "Finished", next: "Taken" },
  { key: "Taken", label: "Finished", next: null },
];

const Orders = () => {
  const { url, token, restaurantSlug } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState({});
  const ordersPerPage = 10;

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const fetchAllOrders = async () => {
    try {
      const slugParam = restaurantSlug ? `?slug=${restaurantSlug}` : "";
      const headers = token ? { headers: { token } } : {};
      const response = await axios.get(url + "/api/order/list" + slugParam, headers);
      if (response.data.success) {
        const paidOrders = response.data.data.filter(
          (order) => order.payment === true
        );
        setOrders(paidOrders);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    const showNewOrderNotification = (order) => {
      const customerName = order?.address?.firstName && order?.address?.lastName
        ? `${order.address.firstName} ${order.address.lastName}`
        : "A customer";
      const amount = order?.amount ?? 0;
      const itemCount = order?.items?.length ?? 0;

      toast.success(`New order received! ${customerName} • Kr ${amount}`);

      try {
        const audio = new Audio(notifySound);
        audio.play();
      } catch (_) { /* ignore */ }

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("New order received!", {
          body: `${customerName} • ${itemCount} item(s) • Kr ${amount}`,
          icon: "/favicon.ico",
          tag: "new-order",
          requireInteraction: true,
        });
      }
    };

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    fetchAllOrders();

    const interval = setInterval(fetchAllOrders, 5000);
    const socket = io(url);

    socket.on("newOrder", (newOrder) => {
      showNewOrderNotification(newOrder);
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [url, token, restaurantSlug]);

  const statusHandler = async (newStatus, orderId) => {
    try {
      const response = await axios.post(
        url + "/api/order/status",
        { orderId, status: newStatus },
        token ? { headers: { token } } : {}
      );
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getNextAction = (status) => {
    const step = STATUS_FLOW.find((s) => s.key === status);
    if (!step || !step.next) return null;
    return { label: step.label, nextStatus: step.next };
  };

  const getStatusPillLabel = (status) => {
    if (status === "Taken") return "Finished";
    if (status === "On its way") return "On its way";
    if (status === "Accepted" || status === "Ready to Takeaway") return "Accepted";
    return "New";
  };

  const getShortName = (firstName, lastName) => {
    const first = firstName || "";
    const last = (lastName || "").charAt(0);
    return last ? `${first} ${last}.` : first || "Customer";
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const groupOrdersByDate = () => {
    const grouped = {};
    orders.forEach((order) => {
      const date = new Date(order.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(order);
    });
    Object.keys(grouped).forEach((d) => {
      grouped[d].sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    return Object.entries(grouped).sort(
      (a, b) => new Date(b[0]) - new Date(a[0])
    );
  };

  const flattenGroupedOrders = () => {
    const grouped = groupOrdersByDate();
    let flat = [];
    grouped.forEach(([date, ords]) => {
      flat.push({ isDateHeader: true, date });
      flat.push(...ords);
    });
    return flat;
  };

  const allOrders = flattenGroupedOrders();
  const paginatedOrders = allOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  return (
    <div className="admin-orders">
      <h2>All Orders</h2>

      <div className="admin-orders-list">
        {paginatedOrders.map((item, index) =>
          item.isDateHeader ? (
            <h4 key={`d-${index}`} className="admin-orders-date">
              {item.date}
            </h4>
          ) : (
            <OrderCard
              key={item._id}
              order={item}
              expanded={expandedOrders[item._id]}
              onToggleExpand={() => toggleExpand(item._id)}
              onStatusChange={statusHandler}
              getNextAction={getNextAction}
              getStatusPillLabel={getStatusPillLabel}
              getShortName={getShortName}
              formatTime={formatTime}
            />
          )
        )}
      </div>

      <div className="admin-orders-pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage * ordersPerPage >= allOrders.length}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

// Modern order card component
function OrderCard({
  order,
  expanded,
  onToggleExpand,
  onStatusChange,
  getNextAction,
  getStatusPillLabel,
  getShortName,
  formatTime,
}) {
  const addr = order.address || {};
  const shortId = order._id ? order._id.slice(-4) : "—";
  const totalItems = order.items?.length || 0;
  const totalAmount = order.amount ?? 0;
  const nextAction = getNextAction(order.status);
  const isFinished = order.status === "Taken";

  return (
    <div className={`admin-order-card ${isFinished ? "finished" : ""}`}>
      {/* Header */}
      <div className="admin-order-card-header">
        <span className="admin-order-id">#{shortId}</span>
        <span className="admin-order-customer">
          {getShortName(addr.firstName, addr.lastName)}
        </span>
        <div className="admin-order-meta">
          <span className="admin-order-time">{formatTime(order.date)}</span>
        </div>
      </div>

      <div className="admin-order-type">
        <span className="admin-order-type-pill">Pickup</span>
      </div>

      {/* Summary & expand */}
      <div className="admin-order-summary-row">
        <span>
          {totalItems} {totalItems === 1 ? "item" : "items"} • Kr {totalAmount}
        </span>
        <button
          type="button"
          className="admin-order-expand-btn"
          onClick={onToggleExpand}
          aria-label={expanded ? "Collapse items" : "Expand items"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: expanded ? "rotate(180deg)" : "none" }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Items list */}
      {expanded && (
        <div className="admin-order-items">
          {order.items?.map((item, idx) => (
            <div key={idx} className="admin-order-item-row">
              <span className="admin-order-item-qty">{item.quantity} ×</span>
              <div className="admin-order-item-details">
                <span className="admin-order-item-name">{item.name}</span>
                {item.mandatoryOptions &&
                  Object.keys(item.mandatoryOptions).length > 0 && (
                    <span className="admin-order-item-options">
                      {Object.entries(item.mandatoryOptions)
                        .map(([k, v]) => `${k}: ${v?.label || ""}`)
                        .join(", ")}
                    </span>
                  )}
                {Array.isArray(item.extras) && item.extras.length > 0 && (
                  <span className="admin-order-item-extras">
                    + {item.extras.map((e) => `${e.name} x${e.quantity || 1}`).join(", ")}
                  </span>
                )}
                {item.comment && (
                  <span className="admin-order-item-note">Note: {item.comment}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address & contact when expanded */}
      {expanded && (
        <div className="admin-order-address-block">
          <p><strong>Address:</strong> {addr.houseNo}, {addr.street}, {addr.zipCode}</p>
          <p><strong>Phone:</strong> {addr.phone}</p>
        </div>
      )}

      {/* Actions */}
      <div className="admin-order-actions">
        {nextAction && !isFinished ? (
          <>
            <button
              type="button"
              className="admin-order-btn primary"
              onClick={() => onStatusChange(nextAction.nextStatus, order._id)}
            >
              {nextAction.label}
            </button>
          </>
        ) : (
          <span className="admin-order-status-pill finished">
            {getStatusPillLabel(order.status)}
          </span>
        )}
      </div>
    </div>
  );
}

export default Orders;
