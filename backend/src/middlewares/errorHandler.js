function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(err.details ? { details: err.details } : {}),
      ...(err.code ? { code: err.code } : {})
    }
  });
}

module.exports = errorHandler;
