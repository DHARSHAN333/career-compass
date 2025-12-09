const validateRequest = (req, res, next) => {
  // Basic request validation
  if (req.method === 'POST' && !req.body) {
    return res.status(400).json({
      error: 'Request body is required'
    });
  }

  // Add more validation as needed
  next();
};

export default validateRequest;
