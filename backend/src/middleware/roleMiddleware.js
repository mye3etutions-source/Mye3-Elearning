const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not logged in' });
    }
    
    // Case-insensitive check
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'User role not defined' });
    }
    const userRole = req.user.role.toLowerCase();
    
    // Admin always authorized for preview/management
    if (userRole === 'admin') {
      return next();
    }

    const authorized = roles.some(role => role.toLowerCase() === userRole);

    if (!authorized) {
      return res.status(403).json({ message: `Role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { authorizeRoles };
