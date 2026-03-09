function loadResource(Model, paramName, reqKey, populate = null) {
  return async (req, res, next) => {
    try {
      const id = req.params[paramName];
      let query = Model.findById(id);
      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(p => {
            query = query.populate(p);
          });
        } else {
          query = query.populate(populate);
        }
      }
      const resource = await query;
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