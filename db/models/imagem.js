'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class imagens extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      imagens.belongsTo(models.noticias, { foreignKey: 'id' });
    }
  }
  imagens.init({
    url: DataTypes.STRING,
    noticiaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'imagens',
  });
  return imagens;
};