const errorHandler = (err, req, res, next) => {
    // Client error
    if (err.type === 'BAD_REQUEST') {
      res.status(400).json({
        error: {
          code: err.code,
          message: err.message,
          codeError: err.codeError
        }
      });
    }
    // Server error
    if (err.type === 'INTERNAL') {
      res.status(500).json({
        error: {
          code: err.code,
          message: err.message,
          codeError: err.codeError
        }
      });
    }
    return next();
  };
  
  module.exports = errorHandler;