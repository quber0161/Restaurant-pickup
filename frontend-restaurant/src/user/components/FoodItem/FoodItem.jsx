/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";

const FoodItem = ({ id, name, price, description, image, extras = [], soldOut = false, mandatoryOptions = [] }) => {
  const { addToCart, url } = useContext(StoreContext);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState({});
  const [comment, setComment] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mandatorySelections, setMandatorySelections] = useState({});

  // 🟢 Increase Extra Quantity
  const increaseExtra = (extraId) => {
    setSelectedExtras((prev) => ({
      ...prev,
      [extraId]: (prev[extraId] || 0) + 1,
    }));
  };

  // 🟢 Decrease Extra Quantity
  const decreaseExtra = (extraId) => {
    setSelectedExtras((prev) => {
      if (!prev[extraId] || prev[extraId] === 0) return prev;
      const newExtras = { ...prev };
      newExtras[extraId] -= 1;
      if (newExtras[extraId] === 0) delete newExtras[extraId];
      return newExtras;
    });
  };

  // 🟢 Handle Mandatory Option Change
  const handleMandatoryChange = (title, choice) => {
    setMandatorySelections((prev) => ({
      ...prev,
      [title]: choice,
    }));
  };

  // 🟢 Handle Add to Cart
  const handleAddToCart = () => {
    // ✅ Check that all mandatory options are selected
    const allSelected = mandatoryOptions.every(opt => mandatorySelections[opt.title]);
    if (!allSelected) {
      alert("Please select all mandatory options before adding to cart.");
      return;
    }
  
    // ✅ Format extras
    const formattedExtras = Object.entries(selectedExtras)
      .filter(([_, quantity]) => quantity > 0)
      .map(([extraId, quantity]) => ({
        _id: extraId,
        quantity: quantity,
      }));
  
    // ✅ Format mandatory options into an array
    const formattedMandatory = Object.entries(mandatorySelections).reduce((acc, [title, choice]) => {
      acc[title] = {
        label: choice.label,
        additionalPrice: choice.additionalPrice || 0,
        _id: choice._id
      };
      return acc;
    }, {});

    
    addToCart(id, formattedExtras, comment, quantity, formattedMandatory);
    
    console.log("formattedMandatory: ",formattedMandatory)
  
    // ✅ Reset state
    setShowPopup(false);
    setSelectedExtras({});
    setComment("");
    setQuantity(1);
    setMandatorySelections({});
  };
  

  return (
    <div className={`food-item ${soldOut ? "sold-out" : ""}`}>
      <div
        className="food-item-image-container"
        onClick={() => { if (!soldOut) setShowPopup(true); }}
        style={{ cursor: soldOut ? "not-allowed" : "pointer" }}
      >
        <img
          className="food-item-image"
          src={url + "/foodimages/" + image}
          alt=""
        />
        {soldOut && <div className="sold-out-overlay">Sold Out</div>}
        {!soldOut && <img className="addicon" src={assets.add_icon_white} alt="Add to Cart" />}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="" />
        </div>
        <p className="food-item-description">{description}</p>
        <p className="food-item-price">Kr {price}</p>
      </div>

      {/* 🟢 Popup for Customization */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Customize Your Order</h3>

            {/* 🔷 Mandatory Options */}
            {mandatoryOptions.length > 0 && (
              <div className="mandatory-options">
                <p>Please choose (Required):</p>
                {mandatoryOptions.map((option, index) => (
                  <div key={index} className="mandatory-group">
                    <p><strong>{option.title}</strong></p>
                    <div className="mandatory-choices">
                    {option.choices.map((choice, idx) => (
                      <label key={idx}>
                        <input
                          type="radio"
                          name={`mandatory-${option.title}`}
                          value={choice.label} // or choice._id, depending on how you store selections
                          checked={mandatorySelections[option.title]?.label === choice.label}
                          onChange={() => handleMandatoryChange(option.title, choice)}
                        />
                        {choice.label} {choice.additionalPrice > 0 ? `(+Kr ${choice.additionalPrice})` : ''}
                      </label>
                    ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 🔶 Extras */}
            {extras.length > 0 ? (
              <>
                <p className="ex-p">Select Extra Ingredients (optional):</p>
                <div className="extra-options">
                  {extras.map((extra, index) => (
                    <div key={index} className="extra-item">
                      <p>{extra.name} (+Kr {extra.price})</p>
                      <div className="extra-quantity">
                        <button onClick={() => decreaseExtra(extra._id)}>-</button>
                        <span>{selectedExtras[extra._id] || 0}</span>
                        <button onClick={() => increaseExtra(extra._id)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-extras">No extra ingredients available.</p>
            )}

            {/* 🔸 Comment Box */}
            <textarea
              placeholder="Add special instructions (e.g., no tomatoes, extra jalapeños)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>

            {/* 🔹 Quantity Selector */}
            <div className="quantity-selector">
              <p>Quantity:</p>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(prev => prev + 1)}>+</button>
              </div>
            </div>

            {/* 🔘 Buttons */}
            <div className="popup-buttons">
              <button onClick={() => setShowPopup(false)}>Cancel</button>
              <button onClick={handleAddToCart}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodItem;
