/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./MenuPage.css";
import Menu from "../../components/Menu/Menu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";

const MenuPage = () => {
  const [category, setCategory] = useState("All");
  const [storeStatus, setStoreStatus] = useState({
    isOpen: false,
    isOrderAllowed: false,
    isPreOrderTime: false,
  });

  useEffect(() => {
    fetch("https://restaurant-pickup-1.onrender.com/api/store-hours/store-status")
      .then(res => res.json())
      .then(data => setStoreStatus(data))
      .catch(err => console.error("Failed to fetch store status", err));
  }, []);

  const { isOpen, isOrderAllowed, isPreOrderTime } = storeStatus;

  return (
    <div className="menu-page">
      {!isOrderAllowed && (
        <div className="store-closed-banner">
          {isPreOrderTime
            ? "The store is currently closed, but you can place a pre-order now."
            : "TThe Restaurant is currently closed. You can browse the menu but ordering is disabled."}
        </div>
      )}
      <Menu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} isOrderAllowed={isOrderAllowed || isPreOrderTime} />
    </div>
  );
};

export default MenuPage;
