/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../user/context/StoreContext";
import "./Restaurants.css";

const Restaurants = () => {
  const { url } = useContext(StoreContext);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    rating: 4.5,
    deliveryTime: "To your hole in 25 min",
    image: "/img/about-1.jpg",
    adminEmail: "",
    adminPassword: "",
  });

  const token = localStorage.getItem("token");

  const fetchRestaurants = () => {
    if (!url) return;
    setLoading(true);
    axios.get(`${url}/api/birdiebite/restaurants/list`).then((res) => {
      if (res.data.success) setRestaurants(res.data.restaurants || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { if (url) fetchRestaurants(); }, [url]);

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      rating: 4.5,
      deliveryTime: "To your hole in 25 min",
      image: "/img/about-1.jpg",
      adminEmail: "",
      adminPassword: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setFormData({
      name: "",
      slug: "",
      rating: 4.5,
      deliveryTime: "To your hole in 25 min",
      image: "/img/about-1.jpg",
      adminEmail: "",
      adminPassword: "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (r) => {
    setFormData({
      name: r.name,
      slug: r.slug || "",
      rating: r.rating,
      deliveryTime: r.deliveryTime,
      image: r.image,
      adminEmail: "",
      adminPassword: "",
    });
    setEditingId(r._id);
    setShowForm(true);
  };

  const handleAddAdmin = (e, restaurantId) => {
    e.stopPropagation();
    const email = prompt("Admin email for this restaurant:");
    if (!email) return;
    const password = prompt("Admin password (min 8 chars):");
    if (!password || password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    axios.post(`${url}/api/birdiebite/restaurants/add-admin/${restaurantId}`, { adminEmail: email, adminPassword: password }, { headers: { token } })
      .then((res) => {
        if (res.data.success) { alert(res.data.message); fetchRestaurants(); }
        else alert(res.data.message || "Failed");
      })
      .catch(() => alert("Failed"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const headers = { headers: { token } };
    const payload = { ...formData };
    if (editingId) delete payload.adminEmail, delete payload.adminPassword;
    if (editingId) {
      axios.put(`${url}/api/birdiebite/restaurants/update/${editingId}`, payload, headers).then((res) => {
        if (res.data.success) { fetchRestaurants(); resetForm(); }
        else alert(res.data.message || "Update failed");
      }).catch(() => alert("Update failed"));
    } else {
      if (!token) {
        alert("You must be logged in as superadmin to add restaurants.");
        return;
      }
      axios.post(`${url}/api/birdiebite/restaurants/add`, payload, headers).then((res) => {
        if (res.data.success) { fetchRestaurants(); resetForm(); }
        else alert(res.data.message || "Add failed");
      }).catch((err) => alert(err.response?.data?.message || err.message || "Add failed"));
    }
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this restaurant?")) return;
    axios.delete(`${url}/api/birdiebite/restaurants/delete/${id}`, { headers: { token } }).then((res) => {
      if (res.data.success) fetchRestaurants();
      else alert(res.data.message || "Delete failed");
    }).catch(() => alert("Delete failed"));
  };

  return (
    <div className="restaurants-admin">
      <div className="restaurants-admin-header">
        <h2>Restaurants</h2>
        <button className="btn-add" onClick={openAddForm} type="button">
          + Add Restaurant
        </button>
      </div>

      {showForm && (
        <form className="restaurant-form" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Restaurant" : "New Restaurant"}</h3>
          <div className="form-row">
            <label>Name</label>
            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="form-row">
            <label>Slug (URL path, e.g. joes-grill)</label>
            <input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="joes-grill" required={!editingId} />
          </div>
          <div className="form-row">
            <label>Rating</label>
            <input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.5 })} />
          </div>
          <div className="form-row">
            <label>Delivery Time</label>
            <input value={formData.deliveryTime} onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })} placeholder="To your hole in 25 min" />
          </div>
          <div className="form-row">
            <label>Image URL</label>
            <input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="/img/about-1.jpg" />
          </div>
          {!editingId && (
            <>
              <div className="form-row">
                <label>Admin Email (for this restaurant&apos;s admin panel)</label>
                <input type="email" value={formData.adminEmail} onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })} placeholder="admin@restaurant.com" />
              </div>
              <div className="form-row">
                <label>Admin Password (min 8 chars)</label>
                <input type="password" value={formData.adminPassword} onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })} placeholder="••••••••" />
              </div>
              <p className="form-hint">Categories & menu items are managed in each restaurant&apos;s own admin dashboard after login.</p>
            </>
          )}
          <div className="form-actions">
            <button type="button" onClick={resetForm}>Cancel</button>
            <button type="submit">{editingId ? "Update" : "Add"}</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="restaurants-grid">
          {restaurants.map((r) => (
            <div key={r._id} className="restaurant-card">
              <div className="restaurant-card-image">
                <img src={r.image?.startsWith("http") ? r.image : (r.image?.startsWith("/") ? r.image : "/" + (r.image || ""))} alt={r.name} onError={(e) => { e.target.src = "/img/about-1.jpg"; }} />
              </div>
              <div className="restaurant-card-info">
                <h4>{r.name}</h4>
                <p>/menu/{r.slug || ""}</p>
                <p className="rating">★ {r.rating} · {r.deliveryTime}</p>
              </div>
              <div className="restaurant-card-actions">
                <button onClick={() => handleEdit(r)}>Edit</button>
                <button className="btn-add-admin" onClick={(e) => handleAddAdmin(e, r._id)} title="Create admin login for this restaurant">+ Add Admin</button>
                <button className="btn-delete" onClick={() => handleDelete(r._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Restaurants;
