// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   try {
//     // Get token from cookie or Authorization header
//     const token =
//       req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({ message: "Authentication required" });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Attach user data to request
//     req.user = decoded;

//     next();
//   } catch (err) {
//     if (err.name === "TokenExpiredError") {
//       return res.status(401).json({
//         message: "Token expired",
//         expired: true,
//       });
//     }
//     return res.status(403).json({ message: "Invalid token" });
//   }
// };

// // Role-based middleware
// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: "Authentication required" });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         message: "You do not have permission to access this resource",
//       });
//     }

//     next();
//   };
// };

// module.exports = { authMiddleware, authorize };




const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded;
    req.user_id = decoded.userId || decoded.id;
    req.business_id = decoded.businessId || null;
    req.owner_id = decoded.ownerId || null;
    req.role = decoded.role || null;

    const normalizedRole = (req.role || "").toLowerCase();
    const isSuperOrAdmin = [
      "superadmin",
      "super_admin",
      "admin",
      "super admin",
    ].includes(normalizedRole);

    // If business_id is missing (shouldn't happen after login except for global super admins), block non-admin access
    if (!req.business_id && !isSuperOrAdmin) {
      return res.status(400).json({ error: "Business ID missing in token" });
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        expired: true,
      });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};

module.exports = { authMiddleware, authorize };
