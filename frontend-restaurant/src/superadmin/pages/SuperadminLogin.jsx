/* eslint-disable react/prop-types */
import React, { useContext, useState } from "react";
import axios from "axios";
import { StoreContext } from "../../user/context/StoreContext";
import "./SuperadminLogin.css";

const SuperadminLogin = () => {
  const { url, setToken, setUserRole } = useContext(StoreContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(url + "/api/user/login", { email, password });
      if (data.success && data.role === "superadmin") {
        setToken(data.token);
        setUserRole(data.role);
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.userId || "superadmin");
      } else {
        setError(data.message || "Superadmin access only");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Network error – is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-login-page">
      <div className="superadmin-login-box">
        <h1>BirdieBite Superadmin</h1>
        <p>Sign in to manage restaurants</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="superadmin-login-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <a href="/" className="superadmin-login-back">← Back to BirdieBite</a>
      </div>
    </div>
  );
};

export default SuperadminLogin;
