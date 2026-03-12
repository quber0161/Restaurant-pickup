/* eslint-disable no-unused-vars */
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserApp from "./user/UserApp";
import AdminApp from "./admin/AdminApp";
import AdminOrders from "./admin/pages/Orders/Orders";
import AdminList from "./admin/pages/List/List";
import AdminAdd from "./admin/pages/Add/Add";
import AdminCategories from "./admin/pages/Categories/Categories";
import AdminExtras from "./admin/pages/Extras/Extras";
import AdminStoreHour from "./admin/pages/StoreHour/StoreHour";
import SuperadminApp from "./superadmin/SuperadminApp";
import NotFound from "./NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/:restaurantSlug" element={<AdminApp />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="list" element={<AdminList />} />
          <Route path="add" element={<AdminAdd />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="extras" element={<AdminExtras />} />
          <Route path="store-hours" element={<AdminStoreHour />} />
        </Route>
        <Route path="/superadmin/*" element={<SuperadminApp />} />
        <Route path="/*" element={<UserApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}


export default App;
