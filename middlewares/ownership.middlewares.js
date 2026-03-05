function checkOwnership(ownerField, resourceKey) {
  return (req, res, next) => {
    const resource = req[resourceKey];
    if (resource[ownerField].toString() !== req.payload._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission for this action"
      });
    }
    next();
  };
};

module.exports = checkOwnership;