/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import { createPortal } from "react-dom";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";

const FoodItem = ({ id, name, price, description, image, extras = [], soldOut = false, mandatoryOptions = [] }) => {
  const { addToCart, url } = useContext(StoreContext);

  const [showPopup, setShowPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

  const resetState = () => {
    setShowPopup(false);
    setCurrentStep(1);
    setSelectedExtras({});
    setComment("");
    setQuantity(1);
    setMandatorySelections({});
  };

  const hasMandatory = mandatoryOptions.length > 0;
  const hasExtras = extras.length > 0;

  const allMandatorySelected = mandatoryOptions.every(
    (opt) => mandatorySelections[opt.title]
  );

  let totalSteps = 1;
  if (hasMandatory && hasExtras) {
    totalSteps = 3; // 1: mandatory, 2: extras, 3: notes/qty
  } else if (hasMandatory || hasExtras) {
    totalSteps = 2; // 1: mandatory or extras, 2: notes/qty
  } else {
    totalSteps = 1; // 1: notes/qty only
  }

  const steps = [];
  if (hasMandatory) steps.push("Options");
  if (hasExtras) steps.push("Extras");
  steps.push("Review");

  const computeExtrasTotal = () => {
    if (!hasExtras) return 0;
    return extras.reduce((sum, extra) => {
      const qty = selectedExtras[extra._id] || 0;
      const extraPrice = extra.price || 0;
      return sum + qty * extraPrice;
    }, 0);
  };

  const computeMandatoryTotal = () => {
    if (!hasMandatory) return 0;
    return Object.values(mandatorySelections || {}).reduce(
      (sum, option) => sum + (option?.additionalPrice || 0),
      0
    );
  };

  const unitPriceWithChoices = price + computeExtrasTotal() + computeMandatoryTotal();
  const lineTotalPrice = unitPriceWithChoices * quantity;

  const goToNextStep = () => {
    // If this step contains mandatory options, require them before continuing
    const mandatoryOnThisStep =
      hasMandatory &&
      ((hasMandatory && hasExtras && currentStep === 1) ||
        (hasMandatory && !hasExtras && currentStep === 1));

    if (mandatoryOnThisStep && !allMandatorySelected) {
      alert("Please complete all required choices before continuing.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // 🟢 Handle Add to Cart
  const handleAddToCart = () => {
    // ✅ Check that all mandatory options are selected
    if (!allMandatorySelected && mandatoryOptions.length > 0) {
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

    // ✅ Reset state
    resetState();
  };
  

  return (
    <>
    <div className={`food-item ${soldOut ? "sold-out" : ""}`}>
      <div
        className="food-item-image-container"
        onClick={() => {
          if (!soldOut) {
            setShowPopup(true);
            setCurrentStep(1);
          }
        }}
        style={{ cursor: soldOut ? "not-allowed" : "pointer" }}
      >
        <img
          className="food-item-image"
          src={image?.startsWith?.("http") ? image : url + "/foodimages/" + image}
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

    </div>
    {/* 🟢 Popup for Customization (portal to body to avoid clipping/transform issues) */}
    {showPopup && createPortal(
      <div className="popup-overlay" onClick={resetState} role="dialog" aria-modal="true">
        <div className="popup" onClick={(e) => e.stopPropagation()}>
          <div className="popup-header">
            <h3>Customize Your Order</h3>
            <p className="popup-step-label">Step {currentStep} of {totalSteps}</p>
            <div className="popup-stepper" aria-hidden="true">
              {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;
                return (
                  <div
                    key={label}
                    className={`popup-stepper-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                  >
                    <div className="popup-stepper-dot">{stepNumber}</div>
                    <span className="popup-stepper-text">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 1 – Mandatory options or extras or notes, depending on what exists */}
          {currentStep === 1 && hasMandatory && (
            <div className="popup-step">
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
                            value={choice.label}
                            checked={mandatorySelections[option.title]?.label === choice.label}
                            onChange={() => handleMandatoryChange(option.title, choice)}
                          />
                          {choice.label} {choice.additionalPrice > 0 ? `(+Kr ${choice.additionalPrice})` : ""}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 or 2 – Extras (optional), depending on whether mandatory exists */}
          {((hasMandatory && hasExtras && currentStep === 2) ||
            (!hasMandatory && hasExtras && currentStep === 1)) && (
            <div className="popup-step">
              <>
                <p className="ex-p">Select extra ingredients (optional)</p>
                <div className="extra-options">
                  {extras.map((extra, index) => (
                    <div key={index} className="extra-item">
                      <p>{extra.name} (+Kr {extra.price})</p>
                      <div className="extra-quantity">
                        <button type="button" onClick={() => decreaseExtra(extra._id)}>-</button>
                        <span>{selectedExtras[extra._id] || 0}</span>
                        <button type="button" onClick={() => increaseExtra(extra._id)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            </div>
          )}

          {/* Final step – Notes, quantity and summary.
              This is step 3 when both mandatory and extras exist,
              step 2 when only one of them exists,
              and step 1 when neither exists. */}
          {((hasMandatory && hasExtras && currentStep === 3) ||
            ((hasMandatory ^ hasExtras) && currentStep === 2) ||
            (!hasMandatory && !hasExtras && currentStep === 1)) && (
            <div className="popup-step">
              <p className="ex-p">Add notes and quantity</p>
              <textarea
                placeholder="Add special instructions (e.g., no tomatoes, extra jalapeños) – optional"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>

              <div className="quantity-selector">
                <p>Quantity:</p>
                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="popup-summary">
                <p><strong>Item:</strong> {name}</p>
                <p><strong>Base price:</strong> Kr {price}</p>
                {hasExtras && (
                  <p><strong>Extras:</strong> Kr {computeExtrasTotal()}</p>
                )}
                {hasMandatory && (
                  <p><strong>Options:</strong> Kr {computeMandatoryTotal()}</p>
                )}
                <p><strong>Current total:</strong> Kr {lineTotalPrice}</p>
              </div>
            </div>
          )}

          {/* Step navigation + Add to cart */}
          <div className="popup-footer">
            <button
              type="button"
              className="popup-footer-btn secondary"
              onClick={currentStep > 1 ? goToPrevStep : resetState}
            >
              {currentStep > 1 ? "← Back" : "Cancel"}
            </button>

            <button
              type="button"
              className="popup-footer-btn primary"
              onClick={currentStep === totalSteps ? handleAddToCart : goToNextStep}
            >
              <span>
                {currentStep === totalSteps ? "Add to Cart" : "Next"}
              </span>
              <span className="popup-footer-divider" />
              <span>Kr {lineTotalPrice}</span>
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
};

export default FoodItem;
