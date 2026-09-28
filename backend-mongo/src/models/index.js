const sequelize = require('../config/sequelize');
const User = require('./User');
const Diligencia = require('./Diligencia');
const Documento = require('./Documento');

// Associations
User.hasMany(Diligencia, { foreignKey: 'userId', onDelete: 'CASCADE' });
Diligencia.belongsTo(User, { foreignKey: 'userId' });

Diligencia.hasMany(Documento, { foreignKey: 'diligenciaId', onDelete: 'CASCADE' });
Documento.belongsTo(Diligencia, { foreignKey: 'diligenciaId' });

module.exports = {
  sequelize,
  User,
  Diligencia,
  Documento
};
