/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";  // ❌ No BrowserRouter here
import Cart from "./pages/Cart/Cart";
import Order from "./pages/Order/Order";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Login from "./components/Login/Login";
import Verify from "./pages/Verify/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";
import MenuPage from "./pages/MenuPAge/MenuPage";
import AboutUs from "./pages/AboutUs/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import GuestTrack from "./pages/GuestTrack/GuestTrack";
import BirdieBiteLanding from "./pages/BirdieBiteLanding/BirdieBiteLanding";

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function UserApp() {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const isBirdieBiteHome = location.pathname === "/";

  return (
    <>
      <ScrollToTop />
      {showLogin && <Login setShowLogin={setShowLogin} />}
      {isBirdieBiteHome ? (
        <Routes>
          <Route path="/" element={<BirdieBiteLanding setShowLogin={setShowLogin} />} />
        </Routes>
      ) : (
        <>
          <div className="page-container">
            <Navbar setShowLogin={setShowLogin} />
            <div className="content-wrap">
              <Routes>
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/menu/:slug" element={<MenuPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order" element={<Order />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/myorders" element={<MyOrders />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/track-order/:token" element={<GuestTrack/>} />
              </Routes>
            </div>
          </div>
          <Footer />
        </>
      )}
    </>
  );
}

export default UserApp;
