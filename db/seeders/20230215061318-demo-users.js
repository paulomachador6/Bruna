// NORMATIZAR O CÓDIGO, AJUDA EVITAR GAMBIARRAS
'use strict';

// CRIPTOGRAFAR SENHA
const bcrypt = require('bcryptjs')

// SEEDERS PARA CADASTRAR REGISTRO NA TABELA "users"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    // CADASTRAR O REGISTRO NA TABELA "users"
    return queryInterface.bulkInsert('users', [{
      nome: 'Paulo Cuadros',
      email: 'pauloroberto2011@gmail.com',
      situationId: 1,
      image: '',
      password: await bcrypt.hash('123456', 8),
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down () {
    
  }
};
