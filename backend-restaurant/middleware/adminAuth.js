import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  const token = req.headers.token;
  if (!token) return res.json({ success: false, message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return res.json({ success: false, message: "Forbidden" });
    req.adminRestaurantId = decoded.restaurantId;
    next();
  } catch {
    res.json({ success: false, message: "Invalid token" });
  }
};

export const optionalAdminAuth = (req, res, next) => {
  const token = req.headers.token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "admin") req.adminRestaurantId = decoded.restaurantId;
  } catch {}
  next();
};
