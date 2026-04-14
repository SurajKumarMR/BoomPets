const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    userId: req.userId,
    endpoint: `${req.method} ${req.path}`,
  });

  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(statusCode).json({ error: message, code, details });
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Invalid or expired token';
    code = 'UNAUTHORIZED';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate entry';
    code = 'DUPLICATE_ERROR';
    const field = Object.keys(err.keyPattern)[0];
    return res.status(statusCode).json({ 
      error: `${field} already exists`, 
      code 
    });
  }

  res.status(statusCode).json({
    error: message,
    code: err.code || code,
  });
};

module.exports = errorHandler;
