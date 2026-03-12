/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./MenuPage.css";
import Menu from "../../components/Menu/Menu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";

const MenuPage = () => {
  const { slug } = useParams();
  const { setRestaurantSlug, restaurantSlug, url } = useContext(StoreContext);
  const [category, setCategory] = useState("All");
  const effectiveSlug = slug ?? restaurantSlug;

  useEffect(() => {
    if (slug) setRestaurantSlug(slug);
  }, [slug, setRestaurantSlug]);
  const [storeStatus, setStoreStatus] = useState({
    isOpen: false,
    isOrderAllowed: true,
    isPreOrderTime: false,
    loading: true,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (effectiveSlug) params.set("slug", effectiveSlug);
    const now = new Date();
    params.set("clientDate", now.toISOString().slice(0, 10));
    params.set("clientTime", now.toTimeString().slice(0, 5));
    fetch(`${url}/api/store-hours/store-status?${params}`)
      .then(res => res.json())
      .then(data => setStoreStatus({ ...data, loading: false }))
      .catch(err => {
        console.error("Failed to fetch store status", err);
        setStoreStatus(prev => ({ ...prev, loading: false, isOrderAllowed: true }));
      });
  }, [effectiveSlug, url]);

  const { isOpen, isOrderAllowed, isPreOrderTime, loading } = storeStatus;

  return (
    <div className="menu-page">
      {!loading && !isOrderAllowed && (
        <div className="store-closed-banner">
          {isPreOrderTime
            ? "The store is currently closed, but you can place a pre-order now."
            : "The restaurant is currently closed. You can browse the menu but ordering is disabled."}
        </div>
      )}
      <Menu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} isOrderAllowed={isOrderAllowed || isPreOrderTime} />
    </div>
  );
};

export default MenuPage;
