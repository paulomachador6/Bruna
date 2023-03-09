'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('imagens', 'noticiaId', {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 0,
          after: "url",
          references: {model: 'noticias', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('imagens', 'noticiaId', { transaction: t })
      ]);
    });
  }
  
};
