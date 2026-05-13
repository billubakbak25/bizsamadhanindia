function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }

  return res.status(401).json({ message: "Unauthorized" });
}

module.exports = { requireAdmin };
