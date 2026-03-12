/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Navbar.css'
import {assets} from '../../assets/assets'
import { StoreContext } from '../../../user/context/StoreContext'

const Navbar = ({ url, token, restaurantSlug }) => {
  const { logout } = useContext(StoreContext);
  const [restaurantName, setRestaurantName] = useState(restaurantSlug ? restaurantSlug.replace(/-/g, " ") : null);

  useEffect(() => {
    if (!url || !restaurantSlug) return;
    axios.get(`${url}/api/birdiebite/restaurants/slug/${restaurantSlug}`)
      .then((res) => {
        if (res.data.success && res.data.restaurant) {
          setRestaurantName(res.data.restaurant.name);
        }
      })
      .catch(() => {});
  }, [url, restaurantSlug]);

  return (
    <div className="navbar-admin">
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <img className="logo" src={assets.logo} alt="Logo" />
        <h1>Admin</h1>
        {restaurantName && <span className="admin-restaurant-label">{restaurantName}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link to={`/menu/${restaurantSlug}`} className="admin-back-menu">View menu</Link>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </div>
  )
}

export default Navbar
