/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3; // Number of orders per page


  // Fetch User Orders
  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      console.log("🔹 API Response:", response.data); // ✅ Debugging
  
      if (response.data.success) {
        const paidOrders = response.data.data.filter(order => order.payment === true);
        console.log("✅ Paid Orders:", paidOrders); // ✅ Check if orders exist
        setData(paidOrders);
      }
    } catch (error) {
      console.error("❌ Error Fetching Orders:", error);
    }
  };
  

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Group orders by date and sort them
  const groupOrdersByDate = () => {
    const groupedOrders = {};

    data.forEach((order) => {
      if (!order.date) return;
      const orderDate = new Date(order.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!groupedOrders[orderDate]) {
        groupedOrders[orderDate] = [];
      }
      groupedOrders[orderDate].push(order);
    });

    Object.keys(groupedOrders).forEach((date) => {
      groupedOrders[date].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    return Object.entries(groupedOrders).sort(
      (a, b) => new Date(b[0]) - new Date(a[0])
    );
  };


  // Flatten grouped orders into a single array for pagination
  const flattenGroupedOrders = () => {
    const groupedOrders = groupOrdersByDate();
    let allOrders = [];

    groupedOrders.forEach(([date, orders]) => {
      allOrders.push({ isDateHeader: true, date });
      allOrders.push(...orders);
    });

    return allOrders;
  };

  const allOrders = flattenGroupedOrders();

  // Get paginated orders
  const paginatedOrders = allOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Change background color based on order status
  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "Order Processing":
        return "#f8d7da"; // 🔴 Light Red
      case "Accepted":
      case "Ready to Takeaway":
        return "#fff3cd"; // 🟡 Light Yellow
      case "On its way":
        return "#dbeafe"; // 🔵 Light Blue
      case "Taken":
        return "#d4edda"; // 🟢 Light Green
      default:
        return "#f8f9fa"; // Light Gray
    }
  };

  const getStatusLabel = (status) => {
    if (status === "Taken") return "Finished";
    if (status === "On its way") return "On its way";
    if (status === "Accepted") return "Accepted";
    if (status === "Ready to Takeaway") return "Ready";
    return status;
  };

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {paginatedOrders.map((order, index) =>
          order.isDateHeader ? (
            <h4 key={index} className="order-date">
              {order.date}
            </h4>
          ) : (
            <div
              key={index}
              className="my-orders-order"
              data-status={order.status}
              style={{
                backgroundColor: getStatusBackgroundColor(order.status),
              }}
            >
            

              {/* Order Items Display */}
              <div className="order-details">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <p>
                      <b>{item.name}</b> x {item.quantity}
                    </p>

                    {/* Display Mandatory Options if available */}
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


                    {/* 🟢 Show Extra Ingredients ONLY for this item */}
                    {item.extras && item.extras.length > 0 && (
                      <p className="order-extras">
                        <b>Extras:</b> {item.extras.map((extra, i) => (
                          <span className="ex" key={i}>
                            {extra.name} x {extra.quantity || 1}
                            {i < item.extras.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </p>
                    )}

                    {/* Display Special Instructions if available */}
                    {item.comment && (
                      <p className="order-comment">
                        <b>Note:</b> {item.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>


              <p>
                <b>Total:</b> Kr {order.amount}.00
              </p>
              <p>
                <b>Items:</b> {order.items.length}
              </p>
              <p>
                <span>&#x25cf;</span> <span className="status-pill">{getStatusLabel(order.status)}</span>
              </p>
              <button onClick={fetchOrders}>Track Order</button>
            </div>
          )
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage * ordersPerPage >= allOrders.length}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MyOrders;
