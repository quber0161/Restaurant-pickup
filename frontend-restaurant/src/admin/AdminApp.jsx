/* eslint-disable no-unused-vars */
import React, { useContext, useEffect } from "react";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { ToastContainer } from "react-toastify";
import { StoreContext } from "../user/context/StoreContext";

const AdminApp = () => {
  const { url, token, userRole } = useContext(StoreContext);
  const navigate = useNavigate();
  const { restaurantSlug } = useParams();

  useEffect(() => {
    if (!token || userRole !== "admin") {
      navigate("/");
    } else if (!restaurantSlug) {
      navigate("/");
    }
  }, [token, userRole, restaurantSlug, navigate]);

  if (!restaurantSlug) return null;

  return (
    <div className="admin-container">
      <ToastContainer />
      <Navbar url={url} token={token} restaurantSlug={restaurantSlug} />
      <hr />
      <div className="app-content">
        <Sidebar restaurantSlug={restaurantSlug} />
        <main className="admin-main">
          <Outlet context={{ url, token, restaurantSlug }} />
        </main>
      </div>
    </div>
  );
};

export default AdminApp;
