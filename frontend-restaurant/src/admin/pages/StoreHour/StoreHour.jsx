/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
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
    const url = "http://localhost:4000";

  const [hours, setHours] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [overrideDate, setOverrideDate] = useState("");

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    const res = await axios.get(`${url}/api/store-hours`);
    const regular = res.data.filter((h) => !h.isOverride);
    const special = res.data.filter((h) => h.isOverride);
    setHours(regular);
    setOverrides(special);
  };

  const updateHour = async (key, field, value, isOverride = false) => {
    const list = isOverride ? overrides : hours;
    const item = list.find((i) => (isOverride ? i.date : i.day) === key) || {};
    const payload = {
      ...item,
      [field]: value,
      day: isOverride ? item.day : key,
      date: isOverride ? key : undefined,
      isOverride,
    };
    await axios.post(`${url}/api/store-hours`, payload);
    fetchHours();
  };

  const addOverride = async () => {
    if (!overrideDate) return;
    const dayName = new Date(overrideDate).toLocaleDateString("en-US", {
      weekday: "long",
    });
    await axios.post(`${url}/api/store-hours`, {
      date: overrideDate,
      day: dayName,
      openTime: "13:00",
      closeTime: "23:00",
      isClosed: false,
      isOverride: true,
    });
    setOverrideDate("");
    fetchHours();
  };

  const deleteOverride = async (date) => {
    await axios.delete(`${url}/api/store-hours/override/${date}`);
    fetchHours();
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
