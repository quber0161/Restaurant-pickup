/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./Categories.css";
import axios from "axios";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";

const Categories = () => {
  const { url, token, restaurantSlug } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = restaurantSlug ? `?slug=${restaurantSlug}` : "";
        const response = await axios.get(`${url}/api/category/list${q}`, { headers: { token } });
        if (response.data.success && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
        } else {
          toast.error("Failed to load categories!");
          setCategories([]); // ✅ Prevent undefined issue
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Error fetching categories!");
        setCategories([]); // ✅ Prevent crash if API fails
      }
    };
    fetchCategories();
  }, [url, token, restaurantSlug]);

  // ✅ Handle Input Change
  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setNewCategory((data) => ({ ...data, [name]: value }));
  };

  // Add Category - optimistic update for instant UI
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!newCategory.name.trim() || !newCategoryImage) {
      toast.error("Category name and image are required!");
      return;
    }

    const name = newCategory.name.trim();
    const imagePreview = URL.createObjectURL(newCategoryImage);

    // Optimistic: show category immediately
    const tempId = "temp-" + Date.now();
    setCategories((prev) => [...prev, { _id: tempId, name, image: imagePreview, _optimistic: true }]);
    setNewCategory({ name: "" });
    setNewCategoryImage(null);
    setAdding(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", newCategoryImage);
    if (restaurantSlug) formData.append("restaurantSlug", restaurantSlug);

    try {
      const response = await axios.post(`${url}/api/category/add`, formData, { headers: { token } });
      if (response.data.success) {
        const serverImage = response.data.image;
        const serverId = response.data.id;
        setCategories((prev) =>
          prev.map((c) =>
            c._id === tempId
              ? { _id: serverId, name, image: serverImage }
              : c
          )
        );
        URL.revokeObjectURL(imagePreview);
        toast.success("Category added!");
      } else {
        setCategories((prev) => prev.filter((c) => c._id !== tempId));
        URL.revokeObjectURL(imagePreview);
        toast.error(response.data.message);
      }
    } catch (error) {
      setCategories((prev) => prev.filter((c) => c._id !== tempId));
      URL.revokeObjectURL(imagePreview);
      toast.error("Error adding category!");
    } finally {
      setAdding(false);
    }
  };

  // Remove Category - optimistic update
  const removeCategory = async (categoryId) => {
    const isTemp = String(categoryId).startsWith("temp-");
    setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
    if (isTemp) return;

    try {
      const response = await axios.post(`${url}/api/category/remove`, { id: categoryId }, { headers: { token } });
      if (response.data.success) {
        toast.success("Category removed!");
      } else {
        setCategories((prev) => [...prev].concat(/* re-add on failure would need stored item */));
        toast.error("Error removing category!");
      }
    } catch (error) {
      toast.error("Error removing category!");
      // Refetch to restore correct state
      const q = restaurantSlug ? `?slug=${restaurantSlug}` : "";
      const res = await axios.get(`${url}/api/category/list${q}`, { headers: { token } });
      if (res.data.success) setCategories(res.data.categories || []);
    }
  };

  return (
    <div className="manage-categories">
      <h2>Manage Categories</h2>

      {/* ✅ Add Category Form */}
      <form onSubmit={onSubmitHandler}>
        <div className="add-category">
          <input
            onChange={onChangeHandler}
            type="text"
            name="name"
            placeholder="Enter new category"
            value={newCategory.name}
          />
          <label htmlFor="image">
            <img className="cat-img"
              src={
                newCategoryImage
                  ? URL.createObjectURL(newCategoryImage)
                  : assets.upload_area
              }
              alt=""
            />
          </label>
          <input
            onChange={(e) => setNewCategoryImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
            required
          />
          <button type="submit" disabled={adding}>Add Category</button>
        </div>
      </form>

      {/* ✅ Display Categories */}
      <ul>
        {categories && categories.length > 0 ? (
          categories.map((cat) => (
            <li key={cat._id}>
              <img
                src={cat.image?.startsWith?.("http") || cat.image?.startsWith?.("blob:") ? cat.image : `${url}/categoryimages/` + cat.image}
                alt={cat.name}
                width="50"
                height="50"
              />
              {cat.name}
              <button onClick={() => removeCategory(cat._id)}>Remove</button>
            </li>
          ))
        ) : (
          <p>Loading categories...</p> // ✅ Prevents crashing if `categories` is empty
        )}
      </ul>
    </div>
  );
};

export default Categories;
