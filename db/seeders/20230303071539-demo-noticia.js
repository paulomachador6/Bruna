'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('noticias', [{
      titulo: 'Notícia Urgente',
      subtitulo: 'Alerta para Notícia de últíma hora',
      conteudo: '1',
      autor: 'Paulo Cuadors',
      createdAt: new Date(),
      updatedAt: new Date()
    },
  {
    titulo: 'Notícia Urgente 2',
    subtitulo: 'Alerta para Notícia 2 de últíma hora',
    conteudo: '2',
    createdAt: new Date(),
    updatedAt: new Date()
  }], {});
  const [noticia1, noticia2] = await queryInterface.sequelize.query(
    'SELECT id FROM noticias;'
  );
  await queryInterface.bulkInsert('imagens', [
    {
      url: 'https://example.com/image1.jpg',
      noticiaId: noticia1[0].id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      url: '16775608186851.jpg',
      noticiaId: noticia1[1].id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],{})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('noticias', null, {});
    await queryInterface.bulkDelete('imagens', null, {});
  }
};
