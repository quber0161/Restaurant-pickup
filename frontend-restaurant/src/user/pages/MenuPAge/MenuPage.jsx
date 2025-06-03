/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./MenuPage.css";
import Menu from "../../components/Menu/Menu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";

const MenuPage = () => {
  const [category, setCategory] = useState("All");
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/store-hours/store-status")
      .then(res => res.json())
      .then(data => setIsStoreOpen(data.isOpen))
      .catch(err => console.error("Failed to fetch store status", err));
  }, []);

  return (
    <div className="menu-page">
      {!isStoreOpen && (
        <div className="store-closed-banner">
          The store is currently closed. You can browse the menu but ordering is disabled.
        </div>
      )}
      <Menu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
    </div>
  );
};

export default MenuPage;
