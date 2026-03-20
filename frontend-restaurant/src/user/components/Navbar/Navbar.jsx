/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext, useState } from 'react';
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({setShowLogin}) => {
    const location = useLocation();
    const {getTotalCartAmount,token,setToken,setUserRole,userRole,restaurantSlug} = useContext(StoreContext);
    const navigate = useNavigate();
  
    const activeNav = location.pathname === "/menu" || location.pathname.startsWith("/menu/") ? "menu" : location.pathname === "/about" ? "contact-us" : "";

    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const logout = () =>{
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        localStorage.removeItem("role")
        setToken("");
        setUserRole("");
        navigate(restaurantSlug ? `/menu/${restaurantSlug}` : "/menu");
    }
    
  return (
    <div className='navbar user-navbar'>
        <Link to='/' className="navbar-back-btn" title="Return to BirdieBite - choose another restaurant">
          <span className="birdiebite-icon" aria-hidden>⛳</span>
          <span className="navbar-back-text navbar-back-full">Return to BirdieBite</span>
          <span className="navbar-back-text navbar-back-short" aria-hidden>BirdieBite</span>
        </Link>
    

        <ul className={`navbar-menu ${showMobileMenu ? 'mobile-visible' : ''}`}>
            <Link to={restaurantSlug ? `/menu/${restaurantSlug}` : "/menu"} onClick={() => setShowMobileMenu(false)} className={activeNav === "menu" ? "active" : ""}>menu</Link>
            <a href='#footer' onClick={() => setShowMobileMenu(false)} className={activeNav === "contact-us" ? "active" : ""}>contact us</a>
        </ul>

        <div className="navbar-right">
            <div className="hamburger" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                ☰
            </div>
            <div className="navbar-search-icon">
            <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
            <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
            </div>

            {!token ? (
            <button onClick={() => setShowLogin(true)}>sign in</button>
            ) : (
            <div className='navbar-profile'>
                <img src={assets.profile_icon} alt="" />
                <ul className="nav-profile-dropdown">
                <li onClick={() => navigate('/myorders')}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
                {userRole === "admin" && restaurantSlug && <li onClick={() => { setShowMobileMenu(false); navigate(`/admin/${restaurantSlug}/orders`); }}><img src={assets.bag_icon} alt="" /><p>Admin</p></li>}
                <hr />
                <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
                </ul>
            </div>
            )}
        </div>
    </div>

  )
}

export default Navbar
