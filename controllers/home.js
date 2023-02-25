// INCLUIR AS BIBLIOTECAS
// GERENCIAR AS REQUISIÇÕES ROTAS e URLs, ENTRE OUTRAS FUNCIONALIDADES.
const express = require('express');
// UTILIZANDO PARA MANIPULAR AS ROTAS DA APLICAÇÃO
const router = express.Router();

// CRIAR A ROTA DA PÁGINA INICIAL

//CRIAR A ROTA RAIZ
router.get('/', (req, res) => {
 // res.send('Página Inicial');
 res.render("admin/login/login", { layout: 'login' });
});

//EXPORTAR A INSTRUÇÃO QUE ESTÁ DENTRO DA CONSTANTE ROUTER
module.exports = router;