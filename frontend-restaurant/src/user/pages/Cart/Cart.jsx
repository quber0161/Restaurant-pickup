/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { Link } from "react-router-dom";

const Cart = () => {
  const {
    cartItems,
    setCartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    loadCartData,
    restaurantSlug,
  } = useContext(StoreContext);

  // Safety: re-sync guest cart from localStorage on mount (handles stale state)
  useEffect(() => {
    if (!token && Object.keys(cartItems).length === 0) {
      try {
        const saved = localStorage.getItem("guestCart");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            setCartItems(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to restore guest cart", e);
      }
    }
  }, [token]);

  const [storeStatus, setStoreStatus] = useState({
    isOpen: false,
    isOrderAllowed: false,
    isPreOrderTime: false,
    loading: true,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (token) {
      loadCartData(token);
    }
    setStoreStatus((prev) => ({ ...prev, loading: true }));
    const params = new URLSearchParams();
    if (restaurantSlug) params.set("slug", restaurantSlug);
    const now = new Date();
    params.set("clientDate", now.toISOString().slice(0, 10));
    params.set("clientTime", now.toTimeString().slice(0, 5));
    fetch(`${url}/api/store-hours/store-status?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setStoreStatus({
          isOpen: data.isOpen,
          isOrderAllowed: data.isOrderAllowed,
          isPreOrderTime: data.isPreOrderTime,
          loading: false,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch store status", err);
        setStoreStatus((prev) => ({ ...prev, loading: false, isOrderAllowed: true }));
      });
  }, [token, restaurantSlug, url]);

  const hasItems = Object.keys(cartItems).length > 0;

  return (
    <div className="cart">
      {!hasItems ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Looks like you have not added anything yet.</p>
          <Link to="/menu">
            <button className="go-shopping-btn">Add food items</button>
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            <div className="cart-items-header">
              <span>Item</span>
              <span>Price</span>
              <span>Qty</span>
              <span>Total</span>
              <span className="cart-header-remove">Remove</span>
            </div>
            {Object.entries(cartItems).map(([key, cartItem]) => {
              const foodItem = food_list.find(
                (product) => product._id === cartItem.itemId
              );

              if (!foodItem) return null;

              const extrasCost = (cartItem.extras || []).reduce(
                (acc, extra) => acc + extra.price * extra.quantity,
                0
              );
              const mandatoryOptionCost = Object.values(
                cartItem.mandatoryOptions || {}
              ).reduce(
                (sum, option) => sum + (option?.additionalPrice || 0),
                0
              );
              const unitPrice =
                foodItem.price + extrasCost + mandatoryOptionCost;
              const lineTotal = unitPrice * cartItem.quantity;

              return (
                <div key={key} className="cart-item-card">
                  <div className="cart-item-top">
                    <img src={foodItem.image?.startsWith?.("http") ? foodItem.image : url + "/foodimages/" + foodItem.image} alt="" className="cart-item-img" />
                    <div className="cart-item-info">
                      <p className="cart-item-name">{foodItem.name}</p>
                      {cartItem.mandatoryOptions && Object.keys(cartItem.mandatoryOptions).length > 0 && (
                        <p className="cart-mandatory-options">
                          <b>Options:</b>{" "}
                          {Object.entries(cartItem.mandatoryOptions).map(
                            ([optKey, selected], idx, arr) => {
                              const label = selected?.label || "";
                              const p = selected?.additionalPrice || 0;
                              return (
                                <span key={optKey}>
                                  {optKey}: {label}{p > 0 ? ` (+Kr ${p})` : ""}
                                  {idx < arr.length - 1 ? ", " : ""}
                                </span>
                              );
                            }
                          )}
                        </p>
                      )}
                      {(cartItem.extras || []).length > 0 && (
                        <p className="cart-extras">
                          <b>Extras:</b>{" "}
                          {cartItem.extras.map((extra, idx) => {
                            const ed = food_list.flatMap((f) => f.extras || []).find((e) => e._id === extra._id);
                            const nm = ed?.name || "Extra";
                            const pr = ed?.price || 0;
                            return (
                              <span key={extra._id}>
                                {nm} x{extra.quantity} (Kr {pr * extra.quantity})
                                {idx < cartItem.extras.length - 1 ? ", " : ""}
                              </span>
                            );
                          })}
                        </p>
                      )}
                      {cartItem.comment && (
                        <p className="cart-comment">
                          <b>Note:</b> {cartItem.comment}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="cart-item-bottom">
                    <span className="cart-item-unit">Kr {unitPrice}</span>
                    <span className="cart-item-qty">{cartItem.quantity}</span>
                    <span className="cart-item-total">Kr {lineTotal}</span>
                    <button className="remove-button" onClick={() => removeFromCart(key)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-bottom">
            <div className="cart-total">
              <h2>Cart Total</h2>
              <div>
                <div className="cart-total-details">
                  <b>Total</b>
                  <b>Kr {getTotalCartAmount()}</b>
                </div>
              </div>

              {storeStatus.loading ? (
                <button disabled className="checkout-btn">Loading...</button>
              ) : storeStatus.isOrderAllowed || storeStatus.isPreOrderTime ? (
                <Link to="/order">
                  <button className="checkout-btn">
                    {storeStatus.isPreOrderTime
                      ? "PRE-ORDER NOW"
                      : "PROCEED TO CHECKOUT"}
                  </button>
                </Link>
              ) : (
                <button disabled className="disabled-checkout-btn">
                  Store is closed
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
