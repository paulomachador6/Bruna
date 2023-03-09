'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class noticias extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      noticias.belongsTo(models.imagens, { foreignKey: 'id' });
      noticias.belongsTo(models.situations, { foreignKey: 'situationId' });
    }
  }
  noticias.init({
    titulo: DataTypes.STRING,
    subtitulo: DataTypes.STRING,
    conteudo: DataTypes.STRING,
    autor: DataTypes.STRING,
    situationId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'noticias',
  });
  return noticias;
};