/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext, useRef } from "react";
import "./Menu.css";
import { StoreContext } from "../../context/StoreContext";

const Menu = ({ category, setCategory }) => {
  const { url, category_list } = useContext(StoreContext);
  const listRef = useRef(null);

  const scrollByAmount = (direction) => {
    const node = listRef.current;
    if (!node) return;
    const viewport = node.clientWidth || 0;
    const amount = (viewport || 200) * 0.8;
    const nextLeft =
      direction === "left"
        ? node.scrollLeft - amount
        : node.scrollLeft + amount;

    node.scrollTo({
      left: nextLeft,
      behavior: "smooth",
    });
  };

  return (
    <div className="menu" id="menu">
      <div className="menu-header">
        <div>
          <h1>Menu</h1>
          <p className="menu-text">Pick a category to start.</p>
        </div>
      </div>

      <div className="menu-list-wrapper">
        <button
          type="button"
          className="menu-scroll-btn menu-scroll-btn-left"
          aria-label="Scroll categories left"
          onClick={() => scrollByAmount("left")}
        >
          ‹
        </button>
        <div
          className="menu-list"
          role="tablist"
          aria-label="Menu categories"
          ref={listRef}
        >
          {category_list.map((item) => {
            const isActive = category === item.name;
            return (
              <div
                onClick={() =>
                  setCategory((prev) => (prev === item.name ? "All" : item.name))
                }
                key={item._id}
                className={`menu-list-item ${isActive ? "active" : ""}`}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
              >
                <img
                  className="category-image"
                  src={
                    item.image?.startsWith?.("http")
                      ? item.image
                      : `${url}/categoryimages/${item.image}`
                  }
                  alt={item.name}
                />
                <p>{item.name}</p>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="menu-scroll-btn menu-scroll-btn-right"
          aria-label="Scroll categories right"
          onClick={() => scrollByAmount("right")}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Menu;
