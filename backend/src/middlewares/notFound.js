function notFound(req, res, next) { // eslint-disable-line
  res.status(404).json({ error: { message: 'Not Found' } });
}

module.exports = notFound;
