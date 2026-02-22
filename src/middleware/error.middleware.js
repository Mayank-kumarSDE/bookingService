import AppError from '../utils/errors/app.error.js';

const errorMiddleware = (err, req, res, next) => {
  // If it's our AppError, use its status code
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  
  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message: err.message || 'Something went wrong!'
  });
};

export default errorMiddleware;