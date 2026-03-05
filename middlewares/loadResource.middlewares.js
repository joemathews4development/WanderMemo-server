function loadResource(Model, paramName, reqKey) {
  return async (req, res, next) => {
    try {
      const id = req.params[paramName];
      const resource = await Model.findById(id);
      if (!resource) {
        return res.status(404).json({
          message: `${Model.modelName} not found`
        });
      }
      req[reqKey] = resource;
      next();
    } catch (err) {
      res.status(500).json({
        message: "Failed to load resource"
      });
    }
  };
};

module.exports = loadResource;