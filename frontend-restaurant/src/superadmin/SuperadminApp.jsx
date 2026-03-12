/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { StoreContext } from "../user/context/StoreContext";
import Restaurants from "./pages/Restaurants";
import SuperadminLogin from "./pages/SuperadminLogin";
import "./SuperadminApp.css";

const SuperadminApp = () => {
  const { token, userRole } = useContext(StoreContext);
  const storedToken = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");
  const hasValidAuth = (token || storedToken) && (userRole === "superadmin" || storedRole === "superadmin");

  if (!hasValidAuth) {
    return (
      <div className="superadmin-app">
        <SuperadminLogin />
      </div>
    );
  }

  return (
    <div className="superadmin-app">
      <header className="superadmin-header">
        <div className="superadmin-header-inner">
          <h1 className="superadmin-title">BirdieBite Superadmin</h1>
          <div className="superadmin-header-actions">
            <a href="/" className="superadmin-back-btn">
              ← Return to BirdieBite
            </a>
            <button
              className="superadmin-logout"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("userId");
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="superadmin-main">
        <Routes>
          <Route path="/" element={<Restaurants />} />
        </Routes>
      </main>
    </div>
  );
};

export default SuperadminApp;
