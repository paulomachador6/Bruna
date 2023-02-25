// Normatizar o código, ajuda evitar gambiarras 
'use strict';
// Incluir as bibliotecas
// Sequelize é utilizado para gerenciar BD
const { Model } = require('sequelize');

// Exportar a instrução que está dentro da função
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // DEFINIR AS ASSOCIAÇÕES
     users.belongsTo(models.situations, { foreignKey: 'situationId' });
    }
  }
  
  // Definir as colunas que a tabela "users" deve ter
  users.init({
    nome: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    recoverPassword: DataTypes.STRING,
    confEmail: DataTypes.STRING,
    image: DataTypes.STRING,
    situationId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'users',
  });

  // Retornar toda instrução que está dentro de users
  return users;
};