/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Add = () => {
  const url = () => "http://localhost:4000";

  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    extras: [], // 🟢 Store selected extra ingredients
  });

  const [categories, setCategories] = useState([]);
  const [extraIngredients, setExtraIngredients] = useState([]); // 🟢 Store all available extras

  const [mandatoryOptions, setMandatoryOptions] = useState([]);
  const [optionTitle, setOptionTitle] = useState("");
  const [optionChoice, setOptionChoice] = useState({ label: "", additionalPrice: 0 });
  const [optionChoices, setOptionChoices] = useState([]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${url()}/api/category/list`);
        if (response.data.success && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    const fetchExtras = async () => {
      try {
        const response = await axios.get(`${url()}/api/extras/list`);
        if (response.data.success) {
          setExtraIngredients(response.data.extras);
        }
      } catch (error) {
        console.error("Error fetching extras:", error);
      }
    };

    fetchCategories();
    fetchExtras();
  }, []);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onExtraChange = (event) => {
    const { value, checked } = event.target;
    setData((prevData) => {
      const newExtras = checked
        ? [...prevData.extras, value]
        : prevData.extras.filter((extra) => extra !== value);
      return { ...prevData, extras: newExtras };
    });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("image", image);
    formData.append("extras", JSON.stringify(data.extras)); // 🟢 Convert extras to JSON string
    formData.append("mandatoryOptions", JSON.stringify(mandatoryOptions));


    try {
      const response = await axios.post(`${url()}/api/food/add`, formData);
      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "",
          extras: [],
        });
        setImage(false);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding food item:", error);
      toast.error("Failed to add food item.");
    }
  };

  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt=""
            />
          </label>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
            required
          />
        </div>

        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Type here"
          />
        </div>

        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
            placeholder="Write description"
            required
          ></textarea>
        </div>

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product Category</p>
            <select
              onChange={onChangeHandler}
              value={data.category}
              name="category"
              required
            >
              <option value="" disabled>
                Select categor
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="add-price flex-col">
            <p>Product Price</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="Number"
              name="price"
              placeholder="Kr"
            />
          </div>
        </div>

        {/* 🟢 Extra Ingredients Selection */}
        <div className="add-extras flex-col">
          <p>Select Extra Ingredients</p>
          <div className="extras-list">
            {extraIngredients.map((extra) => (
              <label key={extra._id} className="extra-option">
                <input
                  type="checkbox"
                  value={extra.name}
                  onChange={onExtraChange}
                  checked={data.extras.includes(extra.name)}
                />
                {extra.name} - Kr{extra.price}
              </label>
            ))}
          </div>
        </div>


        {/* 🔵 Mandatory Options (with per-choice pricing) */}
        <div className="add-mandatory-options flex-col">
          <p>Mandatory Options (e.g., Burger Size, Spice Level)</p>

          <div className="mandatory-form">
            {/* Option Group Title (e.g., Burger Size) */}
            <input
              type="text"
              placeholder="Option Title (e.g., Burger Size)"
              value={optionTitle}
              onChange={(e) => setOptionTitle(e.target.value)}
            />

            {/* Choice Input: Label and Price */}
            <div className="choices-wrapper">
              <input
                type="text"
                placeholder="Choice Label (e.g., 130g)"
                value={optionChoice.label || ""}
                onChange={(e) =>
                  setOptionChoice((prev) => ({ ...prev, label: e.target.value }))
                }
              />
              <input
                type="number"
                placeholder="Additional Price (e.g., 25)"
                value={optionChoice.additionalPrice || ""}
                onChange={(e) =>
                  setOptionChoice((prev) => ({
                    ...prev,
                    additionalPrice: Number(e.target.value),
                  }))
                }
              />
              <button
                type="button"
                onClick={() => {
                  if (optionChoice.label) {
                    setOptionChoices([...optionChoices, optionChoice]);
                    setOptionChoice({});
                  }
                }}
              >
                Add Choice
              </button>
            </div>

            {/* Show Added Choices for This Group */}
            <div className="current-choices">
              {optionChoices.map((choice, idx) => (
                <span key={idx} className="choice-item">
                  {choice.label} {choice.additionalPrice ? `( +${choice.additionalPrice}kr )` : ""}
                  <button
                    type="button"
                    onClick={() =>
                      setOptionChoices(optionChoices.filter((_, i) => i !== idx))
                    }
                  >
                    ❌
                  </button>
                </span>
              ))}
            </div>

            {/* Save This Option Group */}
            <button
              type="button"
              onClick={() => {
                if (optionTitle && optionChoices.length) {
                  setMandatoryOptions([
                    ...mandatoryOptions,
                    { title: optionTitle, choices: optionChoices },
                  ]);
                  setOptionTitle("");
                  setOptionChoices([]);
                }
              }}
            >
              Save Option Group
            </button>
          </div>

          {/* Display All Saved Option Groups */}
          <div className="saved-options">
            {mandatoryOptions.map((opt, idx) => (
              <div key={idx} className="saved-option">
                <strong>{opt.title}</strong>:
                {opt.choices.map((c, i) => (
                  <span key={i}>
                    {" "}
                    {c.label} {c.additionalPrice ? `( +${c.additionalPrice}kr )` : ""}
                    {i !== opt.choices.length - 1 && ","}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>



        <button type="submit" className="add-button">
          ADD
        </button>
      </form>
    </div>
  );
};

export default Add;
