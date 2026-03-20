/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./Extras.css";
import axios from "axios";
import { toast } from "react-toastify";


const Extras = () => {
  const { url, token, restaurantSlug } = useOutletContext();
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newExtra, setNewExtra] = useState({ name: "", price: "" });

  // Fetch extras for this restaurant only
  const fetchExtras = async () => {
    if (!url || !restaurantSlug) return;
    setLoading(true);
    try {
      const slugParam = `?slug=${restaurantSlug}`;
      const headers = token ? { headers: { token } } : {};
      const response = await axios.get(`${url}/api/extras/list${slugParam}`, headers);
      if (response.data.success) {
        setExtras(Array.isArray(response.data.extras) ? response.data.extras : []);
      } else {
        toast.error("Error fetching extras");
        setExtras([]);
      }
    } catch (error) {
      console.error("Error fetching extras:", error);
      toast.error("Failed to load extra ingredients");
      setExtras([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExtras();
  }, [url, token, restaurantSlug]);

  // 🟢 Handle input changes
  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setNewExtra((prev) => ({ ...prev, [name]: value }));
  };

  // Add extra - optimistic update
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!newExtra.name.trim() || !newExtra.price) {
      toast.error("Extra name and price are required!");
      return;
    }

    const tempId = "temp-" + Date.now();
    const item = { ...newExtra, _id: tempId };
    setExtras((prev) => [...prev, item]);
    setNewExtra({ name: "", price: "" });

    try {
      const payload = { ...newExtra, restaurantSlug };
      const headers = token ? { headers: { token } } : {};
      const response = await axios.post(`${url}/api/extras/add`, payload, headers);
      if (response.data.success) {
        const serverId = response.data.id || response.data._id;
        setExtras((prev) => prev.map((e) => (e._id === tempId ? { ...e, _id: serverId } : e)));
        toast.success("Extra added!");
      } else {
        setExtras((prev) => prev.filter((e) => e._id !== tempId));
        toast.error(response.data.message);
      }
    } catch (error) {
      setExtras((prev) => prev.filter((e) => e._id !== tempId));
      toast.error("Error adding extra ingredient");
    }
  };

  // Remove extra - optimistic update
  const removeExtra = async (extraId) => {
    const removed = extras.find((e) => e._id === extraId);
    setExtras((prev) => prev.filter((e) => e._id !== extraId));
    if (String(extraId).startsWith("temp-")) return;

    try {
      const headers = token ? { headers: { token } } : {};
      const response = await axios.post(`${url}/api/extras/remove`, { id: extraId }, headers);
      if (response.data.success) toast.success("Extra removed!");
      else {
        if (removed) setExtras((prev) => [...prev, removed]);
        toast.error("Error removing extra!");
      }
    } catch (error) {
      if (removed) setExtras((prev) => [...prev, removed]);
      toast.error("Error removing extra ingredient!");
    }
  };

  return (
    <div className="manage-extras">
      <h2>Manage Extra Ingredients</h2>

      {/* 🟢 Add Extra Form */}
      <form onSubmit={onSubmitHandler}>
        <div className="add-extra">
          <input
            type="text"
            name="name"
            placeholder="Extra Ingredient Name"
            value={newExtra.name}
            onChange={onChangeHandler}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price (Kr)"
            value={newExtra.price}
            onChange={onChangeHandler}
            required
          />
          <button type="submit">Add Extra</button>
        </div>
      </form>

      {/* 🟢 Display Extras */}
      <ul>
        {loading ? (
          <p>Loading extra ingredients...</p>
        ) : extras.length > 0 ? (
          extras.map((extra) => (
            <li className="ex-li" key={extra._id}>
              <p>{extra.name} - Kr {extra.price}</p>
              <button onClick={() => removeExtra(extra._id)}>Remove</button>
            </li>
          ))
        ) : (
          <p>No extra ingredients yet. Add one above.</p>
        )}
      </ul>
    </div>
  );
};

export default Extras;
