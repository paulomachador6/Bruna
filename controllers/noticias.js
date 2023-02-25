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

//CRIAR A ROTA DO LISTAR USUÁRIOS, USAR A FUNÇÃO eAdmin COM MIDDLEWARE PARA
//VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
router.get('/', eAdmin, async (req, res) => {
  // RECEBER O NÚMERO DA PÁGINA, QUANDO NÃO É ENVIADO O NÚMERO DA PÁGINA É ATRIBUIDO PARA PAGE 1
  const { page = 1 } = req.query;
  // LIMITE DE REGISTROS EM CADA PÁGINA
  const limit = 4;
  // VARIÁVEL COM O NÚMERO DA ÚLTIMA PÁGINA
  var lastPage = 1;
  // CONTAR A QUANTIDADE DE REGISTROS NO BD
  const countNoticias = await db.noticias.count();
  // ACESSAR O IF QUANDO ENCONTRAR O REGISTRO NO BD
  if (countNoticias !== 0) {
    // CALCULAR A ÚLTIMA PÁGINA
    lastPage = Math.ceil(countNoticias / limit);
  } else {
    // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL ITEM DE MENU DEVE FICAR ATIVO, ENVIAR MSG ERRO.
    return res.render("admin/noticias/list", { layout: 'main', profile: req.user.dataValues, sidebarNoticias: true, danger_msg: 'ERRO: Nenhuma notícia encontrada!' });
  }
  // RECUPERAR TODOS OS USUÁRIOS DO DB.
  await db.noticias.findAll({
    // INDICAR QUAIS COLUNAS RECUPERAR
    attributes: ['id', 'nome', 'descricao'],
    // ORDENAR OS REGISTROS PELA COLUNA ID NA FORMA DECRESCENTE
    order: [['id', 'ASC']],
    // console.log((page * limit) - limit); //2 * 4 = 8 //page 1: 1,2,3,4 - page 2: 5,6,7,8 
    offset: Number((page * limit) - limit),
    limit: limit
  }).then((noticias) => {
    // ACESSA O IF QUANDO RETORNAR REGISTRO DO BD.
    if (noticias.length !== 0) {
      var pagination = {
        // CAMINHO.
        path: '/noticias',
        // PAGINA ATUAL
        page,
        // URL DA PÁGINA ANTERIOR
        prev_page_url: ((Number(page) - Number(1)) >= 1) ? Number(page) - Number(1) : false,
        // URL DA PRÓXIMA PÁGINA
        next_page_url: ((Number(page) + Number(1)) > Number(lastPage)) ? false : Number(page) + Number(1),
        // ÚLTIMA PÁGINA
        lastPage
      }
      // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL ITEM DE MENU DEVE FICAR ATIVO, ENVIAR MSG ERRO.
      res.render("admin/noticias/list", { layout: 'main', profile: req.user.dataValues, sidebarNoticias: true, noticias: noticias.map(id => id.toJSON()), pagination });
    } else {
      // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL ITEM DE MENU DEVE FICAR ATIVO, ENVIAR MSG ERRO.
      res.render("admin/noticias/list", { layout: 'main', profile: req.user.dataValues, sidebarNoticias: true, danger_msg: 'ERRO: Nenhuma notícia encontrada!' });
    }
  }).catch(() => {
    // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL ITEM DE MENU DEVE FICAR ATIVO, ENVIAR MSG ERRO.
    res.render("admin/noticias/list", { layout: 'main', profile: req.user.dataValues, sidebarNoticias: true, danger_msg: 'ERRO: Nenhuma notícia encontrada!' });
  })
});

// CRIAR A ROTA PARA PÁGINA VISUALIZAR OS DETALHES DO REGISTRO.
router.get('/view/:id', eAdmin, async (req, res) => {

  // RECEBER O ID ENVIADO NA URL.
  const { id } = req.params;

  // RECUPERAR O REGISTRO DO BD.
  const noticia = await db.noticias.findOne({
    // INDICAR QUAIS COLUNAS RECUPERAR.
    attributes: ['id', 'nome', 'descricao',],
    // ACRESCENTANDO A CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      id
    }
  });

  // ACESSA O IF SE ENCONTRAR O REGISTRO NO BD.
  if (noticia) {
    res.render("admin/noticias/view", { layout: 'main', profile: req.user.dataValues, sidebarNoticias: true, noticia });
  } else {
    // CRIAR A MENSAGEM DO ERRO.
    req.flash("danger_msg", "ERRO: Notícia não encontrada!"),
      // REDIRECIONAR O USUÁRIO.
      res.redirect('/noticias');
  }
});

//EXPORTAR A INSTRUÇÃO QUE ESTÁ DENTRO DA CONSTANTE ROUTER
module.exports = router;