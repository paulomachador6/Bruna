// Normatizar o código, ajuda evitar gambiarras 
'use strict';
// Seeders para cadastrar registro na tabela "situations"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   // CADASTRAR O REGISTRO NA TABELA "situations"
   return queryInterface.bulkInsert('situations', [{
    nomeSituacao: 'Ativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomeSituacao: 'Inativo',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomeSituacao: 'Descadastrado',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    nomeSituacao: 'Spam',
    createdAt: new Date(),
    updatedAt: new Date()
  }]);
},

async down () {
  
}
};
