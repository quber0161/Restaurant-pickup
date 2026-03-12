/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import "./StoreHour.css";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function StoreHour() {
  const { url, token, restaurantSlug } = useOutletContext();

  const [hours, setHours] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [overrideDate, setOverrideDate] = useState("");

  useEffect(() => {
    fetchHours();
  }, [restaurantSlug]);

  const fetchHours = async () => {
    const slugParam = restaurantSlug ? `?slug=${restaurantSlug}` : "";
    const headers = token ? { headers: { token } } : {};
    const res = await axios.get(`${url}/api/store-hours${slugParam}`, headers);
    const regular = res.data.filter((h) => !h.isOverride);
    const special = res.data.filter((h) => h.isOverride);
    setHours(regular);
    setOverrides(special);
  };

  const debounceRef = useRef(null);

  const updateHour = (key, field, value, isOverride = false) => {
    const list = isOverride ? overrides : hours;
    const item = list.find((i) => (isOverride ? i.date : i.day) === key) || {};
    const updated = {
      ...item,
      [field]: value,
      day: isOverride ? item.day : key,
      date: isOverride ? key : undefined,
      isOverride,
    };
    // Optimistic update
    if (isOverride) {
      setOverrides((prev) =>
        prev.some((i) => i.date === key)
          ? prev.map((i) => (i.date === key ? updated : i))
          : [...prev, updated]
      );
    } else {
      setHours((prev) => {
        const exists = prev.find((i) => i.day === key);
        if (exists) return prev.map((i) => (i.day === key ? updated : i));
        return [...prev, updated];
      });
    }
    // Debounce API call
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const payload = { ...updated, restaurantSlug };
      const headers = token ? { headers: { token } } : {};
      try {
        await axios.post(`${url}/api/store-hours`, payload, headers);
      } catch {
        fetchHours(); // Restore on error
      }
      debounceRef.current = null;
    }, 400);
  };

  const addOverride = async () => {
    if (!overrideDate) return;
    const dayName = new Date(overrideDate).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const newOverride = {
      date: overrideDate,
      day: dayName,
      openTime: "13:00",
      closeTime: "23:00",
      isClosed: false,
      isOverride: true,
    };
    setOverrides((prev) => [...prev, newOverride]);
    setOverrideDate("");
    const headers = token ? { headers: { token } } : {};
    try {
      await axios.post(`${url}/api/store-hours`, { ...newOverride, restaurantSlug }, headers);
    } catch {
      setOverrideDate(overrideDate);
      fetchHours();
    }
  };

  const deleteOverride = async (date) => {
    setOverrides((prev) => prev.filter((o) => o.date !== date));
    const slugParam = restaurantSlug ? `?slug=${restaurantSlug}` : "";
    const headers = token ? { headers: { token } } : {};
    try {
      await axios.delete(`${url}/api/store-hours/override/${date}${slugParam}`, headers);
    } catch {
      fetchHours();
    }
  };

  return (
    <div className="store-hours-container">
      <h2 className="store-hours-title">Weekly Schedule</h2>
      {daysOfWeek.map((day) => {
        const h = hours.find((h) => h.day === day) || {};
        return (
          <div key={day} className="day-row">
            <div className="day-label">{day}</div>
            <input
              type="time"
              className="time-input"
              value={h.openTime || "13:00"}
              disabled={h.isClosed}
              onChange={(e) => updateHour(day, "openTime", e.target.value)}
            />
            <input
              type="time"
              className="time-input"
              value={h.closeTime || "23:00"}
              disabled={h.isClosed}
              onChange={(e) => updateHour(day, "closeTime", e.target.value)}
            />
            <label className="closed-checkbox">
              <input
                type="checkbox"
                checked={h.isClosed || false}
                onChange={(e) => updateHour(day, "isClosed", e.target.checked)}
              />
              Closed
            </label>
          </div>
        );
      })}

      <h2 className="store-hours-title">Overrides (Specific Dates)</h2>
      <div className="override-add-row">
        <input
          type="date"
          className="date-input"
          value={overrideDate}
          onChange={(e) => setOverrideDate(e.target.value)}
        />
        <button className="add-override-btn" onClick={addOverride}>
          Add Override
        </button>
      </div>

      {overrides.map((o) => (
        <div key={o.date} className="day-row">
          <div className="day-label">
            {o.date} ({o.day})
          </div>
          <input
            type="time"
            className="time-input"
            value={o.openTime}
            disabled={o.isClosed}
            onChange={(e) =>
              updateHour(o.date, "openTime", e.target.value, true)
            }
          />
          <input
            type="time"
            className="time-input"
            value={o.closeTime}
            disabled={o.isClosed}
            onChange={(e) =>
              updateHour(o.date, "closeTime", e.target.value, true)
            }
          />
          <label className="closed-checkbox">
            <input
              type="checkbox"
              checked={o.isClosed}
              onChange={(e) =>
                updateHour(o.date, "isClosed", e.target.checked, true)
              }
            />
            Closed
          </label>
          <button className="delete-btn" onClick={() => deleteOverride(o.date)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
