// INCLUIR AS BIBLIOTECAS
// GERENCIAR AS REQUISIÇÕES ROTAS e URLs, ENTRE OUTRAS FUNCIONALIDADES.
const express = require('express');
// UTILIZANDO PARA MANIPULAR AS ROTAS DA APLICAÇÃO.
const router = express.Router();
// ARQUIVO COM A FUNCIONALIDADE PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
const { eAdmin } = require("../helpers/eAdmin");
// INCLUIR O ARQUIVO QUE POSSUI A CONEXÃO COM BD.
const db = require("./../db/models");
// Validar input do formulário
const yup = require('yup');
// Operador do sequelize 
const { Op } = require("sequelize");
// INCLUIR O ARQUIVO COM A FUNÇÃO DE UPLOAD
const uploads = require('../helpers/uploadImgUsers');
// O MÓDULO FS PERMITE INTERAGIR COM O SISTEMA DE ARQUIVOS
const fs = require('fs');

const path = require('path');

// CRIAR A ROTA APAGAR O USUÁRIO NO BD, USAR A FUNCÃO eAdmin com middleware para verificar se o usuário está logado
router.get('/images/delete-image/:id', async (req, res) => {

  // RECUPERAR O REGISTRO NO BD.
  const imagem = await db.imagens.findOne({
    // INDICAR QUAIS COLUNAS RECUPERAR
    attributes: ['id','url','noticiaId'],

    // ACRESCENTAR CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      id: req.params.id
    }
  });

  // VERIFICAR SE O USUÁRIO TEM IMAGEM SALVA NO BD.
  if (imagem.dataValues.url) {
    // CRIAR O CAMINHO DA IMAGEM QUE O USUÁRIO TEM NO BD.
    var imgOld = "./public/images/news/" + noticia.dataValues.url;

    // fs.access usado para testar as permissões do arquivo
    fs.access(imgOld, (err) => {
      // ACESSA O IF QUANDO NÃO TIVER NENHUM ERRO
      if (!err) {
        // APAGAR A IMAGEM ANTIGA
        fs.unlink(imgOld, () => { })
      }
    });
  }

  db.imagem.destroy({
    // ACRESCENTAR O WHERE NA INSTRUÇÃO SQL INDICANDO QUAL REGISTRO EXCLUIR NO BD.
    where: {
      id: req.params.id
    }
  }).then(() => {
    // CRIAR A MENSAGEM DE USUÁRIO APAGADO COM SUCESSO
    req.flash("success_msg", "Imagem apagada com sucesso!");
    // REDIRECIONAR O USUÁRIO APÓS APAGAR COM SUCESSO
    res.redirect('/noticias?view=1');
  }).catch(() => {
    // CRIAR A MENSAGEM DE ERRO
    req.flash("danger_msg", "ERRO: Imagem não deletada! ");
    // REDIRECIONAR O USUÁRIO APÓS ERRO NA EXCLUSÃO.
    res.redirect('/noticias/view' + req.params.id);
  })
})

//EXPORTAR A INSTRUÇÃO QUE ESTÁ DENTRO DA CONSTANTE ROUTER
module.exports = router;