const noticiasMigratoriasService = require('../services/noticiasMigratorias.service');

exports.getNoticiasMigratorias = async (req, res, next) => {
  try {
    const { items, status } = await noticiasMigratoriasService.getNoticiasMigratorias();
    res.set('X-News-Source-Status', status);
    res.json(items);
  } catch (error) {
    next(error);
  }
};
