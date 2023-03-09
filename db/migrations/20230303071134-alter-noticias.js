'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('noticias', 'situationId', {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 2,
          after: "conteudo",
          references: {model: 'situations', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('noticias', 'situationId', { transaction: t })
      ]);
    });
  }
};
