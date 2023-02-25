// INCLUIR AS BIBLIOTECAS
// GERENCIAR AS REQUISIÇÕES ROTAS e URLs, ENTRE OUTRAS FUNCIONALIDADES.
const express = require('express');
// UTILIZANDO PARA MANIPULAR AS ROTAS DA APLICAÇÃO
const router = express.Router();
// ARQUIVO COM A FUNCIONALIDADE PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO
const {eAdmin} = require("../helpers/eAdmin");
// INCLUIR O ARQUIVO QUE POSSUI A CONEXÃO COM BD.
const db = require("./../db/models");

// CRIAR A ROTA DA PÁGINA INICIAL

//CRIAR A ROTA RAIZ
router.get('/', eAdmin, async (req, res) => {

  // CONTAR A QUANTIDADE DE REGISTROS NO BD.
  const countUser = await db.users.count();

  // CRIAR A VARIÁVEL PARA RECEBER OS DADOS.
  var data = {countUser}

  res.render("admin/dashboard/dashboard", { layout: 'main', profile: req.user.dataValues, data, sidebarDashboard: true});
});

//EXPORTAR A INSTRUÇÃO QUE ESTÁ DENTRO DA CONSTANTE ROUTER
module.exports = router;