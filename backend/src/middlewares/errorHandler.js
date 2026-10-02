function errorHandler(err, req, res, next) { // eslint-disable-line
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  // En producción no se devuelven detalles internos (SQL, rutas, stack) de errores 5xx.
  const hideDetails = status >= 500 && process.env.NODE_ENV === 'production';
  res.status(status).json({
    error: {
      message: hideDetails ? 'Error interno del servidor' : (err.message || 'Internal Server Error'),
      ...(!hideDetails && err.details ? { details: err.details } : {}),
      ...(err.code && !hideDetails ? { code: err.code } : {})
    }
  });
}

module.exports = errorHandler;
