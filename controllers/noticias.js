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
    attributes: ['id', 'titulo', 'subtitulo'],
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
  const noticia = await db.noticias.findAll({
    // INDICAR QUAIS COLUNAS RECUPERAR.
    attributes: ['id', 'titulo', 'subtitulo', 'conteudo', 'autor', 'situationId'],
    // ACRESCENTANDO A CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      id
    },
    // BUSCAR DADOS NA TABELA SECUNDÁRIA
    include: [{
      model: db.situations,
      attributes: ['nomeSituacao']
    },
    ]
  });

  // Recuperar as imagnes do banco de dados
  const imagens = await db.imagens.findAll({
    // Indicar quais colunas recuperar
    attributes: ['id', 'noticiaId', ['url', 'urlOld']],

    // ACRESCENTAR CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      noticiaId: id
    },
  });

  const noticiaArray = noticia.map(noticia => {
    return {
      id: noticia.dataValues.id,
      titulo: noticia.dataValues.titulo,
      subtitulo: noticia.dataValues.subtitulo,
      conteudo: noticia.dataValues.conteudo,
      autor: noticia.dataValues.autor,
      situationId: noticia.dataValues.situationId,
      nomeSituacao: noticia.situation.nomeSituacao,
    }
  })

  // REALIZAR A INTERAÇÃO SOBRE AS IMAGENS E SALVAR O ARRAY NA CONST
  const imagem = imagens.map(imagens => {
    return {
      id: imagens.dataValues.id,
      url: imagens.dataValues.url,
      urlOld: imagens.dataValues.urlOld,
      noticiaId: imagens.dataValues.noticiaId
    }
  })

  // ACESSA O IF SE ENCONTRAR O REGISTRO NO BD.
  if (noticiaArray) {
    res.render("admin/noticias/view", { layout: 'main', profile: req.user.dataValues, sidebarNoticias: true, noticia: noticiaArray, imagem });
  } else {
    // CRIAR A MENSAGEM DO ERRO.
    req.flash("danger_msg", "ERRO: Notícia não encontrada!"),
      // REDIRECIONAR O USUÁRIO.
      res.redirect('/noticias');
  }
});

// CRIAR A ROTA PARA PÁGINA COM FORMULÁRIO CADASTRAR USUÁRIO.
router.get('/add', eAdmin, async (req, res) => {
  var dataForm = [];


  // RECUPERAR AS SITUAÇÕES DO BD.
  const situations = await db.situations.findAll({
    // INDICAR QUAIS COLUNAS RECUPERAR.
    attributes: ['id', 'nomeSituacao'],
    // ORDER OS REGISTROS PELA COLUNA 'NOMESITUACAO' NA FORMA CORRETA.
    order: [['nomeSituacao', 'ASC']]
  });

  // ACESSA O IF QUANDO ENCONTRAR SITUAÇÕES NO BANCO DE DADOS E ATRIBUI PARA VARIÁVEL ENVIAR DADOS 
  // PARA O FORMULÁRIO.
  if (situations) {
    dataForm['situations'] = situations;
  }

  // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL
  // O ITEM DE MENU DEVE FICAR ATIVO
  res.render('admin/noticias/add', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarNoticias: true });
});

router.post('/add', async (req, res) => {
  // RECEBER OS DADOS DO FORM.
  var data = req.body;
  // INICIO ENVIAR DADOS PARA O FORMULÁRIO.
  // ENVIAR DADOS PARA O FORMULÁRIO.
  var dataForm = req.body;

  // RECUPERAR AS SITUAÇÕES DO BD.
  const situations = await db.situations.findAll({
    // INDICAR QUAIS COLUNAS RECUPERAR.
    attributes: ['id', 'nomeSituacao'],
    // ORDER OS REGISTROS PELA COLUNA 'NOMESITUACAO' NA FORMA CORRETA.
    order: [['nomeSituacao', 'ASC']]
  });

  // ACESSA O IF QUANDO ENCONTRAR SITUAÇÕES NO BANCO DE DADOS E ATRIBUI PARA VARIÁVEL ENVIAR DADOS 
  // PARA O FORMULÁRIO.
  if (situations) {
    dataForm['situations'] = situations;
  }

  // RECUPERAR A SITUAÇÃO NO BD.
  const situation = await db.situations.findOne({
    // INDICAR QUAIS COLUNAS RECUPERAR.
    attributes: ['id', 'nomeSituacao'],
    // ACRESCENTANDO A CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      id: data.situationId
    },
    // ORDER OS REGISTROS PELA COLUNA 'NOMESITUACAO' NA FORMA CORRETA.
    order: [['nomeSituacao', 'ASC']]
  });

  // ACESSA O IF QUANDO ENCONTRAR SITUAÇÕES NO BD E ATRIBUI PARA VARIÁVEL ENVIAR DADOS PARA O FORM.
  if (situation) {
    dataForm['situation'] = situation;
  }
  // Validar os campos utilizando o yup
  const schema = yup.object().shape({
    situationId: yup.string("Erro: Necessário preencher o campo situação!")
      .required("Erro: Necessário preencher o campo situação!"),
    autor: yup.string("Erro: Necessário preencher o campo Autor!")
      .required("Erro: Necessário preencher o campo Autor!"),
    conteudo: yup.string("Erro: Necessário preencher o campo conteúdo!")
      .required("Erro: Necessário preencher o campo conteúdo!"),
    titulo: yup.string("Erro: Necessário preencher o campo título!")
      .required("Erro: Necessário preencher o campo título!"),
  });

  // Verificar se todos os campos passaram pela validação
  try {
    await schema.validate(data);
  } catch (error) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    return res.render("admin/noticias/add", { layout: 'main', profile: req.user.dataValues, sidebarNoticias: true, data: dataForm, danger_msg: error.errors });
  }
  // Cadastrar no banco de dados
  db.noticias.create(data).then((dataNoticia) => {
    // Criar a mensagem de usuário cadastrado com sucesso
    req.flash("success_msg", "Usuário cadastrado com sucesso!");
    // Redirecionar o usuário após cadastrar 
    //res.redirect('/users?page=1');
    res.redirect('/noticias/view/' + dataNoticia.id)
  }).catch(() => {
    res.send("ERRO")
  });
});

// CRIAR A ROTA PARA PÁGINA COM FORMULÁRIO EDITAR USUÁRIO.
router.get('/edit/:id', eAdmin, async (req, res) => {

  // RECEBER O ID ENVIADO NA URL
  const { id } = req.params;
  // RECUPERAR O REGISTRO DO BD.
  const noticia = await db.noticias.findOne({
    // INDICAR QUAIS COLUNAS RECUPERAR DO BD.
    attributes: ['id', 'titulo', 'subtitulo', 'conteudo', 'autor', 'situationId'],
    // ACRESCENTAR CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      id
    },
    // BUSCAR NA TABELA SECUNDÁRIA
    include: [{
      model: db.situations,
      attributes: ['id', 'nomeSituacao']
    }]
  });

  // ACESSA O IF SE ENCONTRAR O REGISTRO NO BD.
  if (noticia) {
    // ENVIAR DADOS PARA O FORMULÁRIO
    var dataForm = noticia.dataValues;

    // RECUPERAR AS SITUAÇÕES DO BD.
    const situations = await db.situations.findAll({
      // INDICAR QUAIS COLUNAS RECUPERAR.
      attributes: ['id', 'nomeSituacao'],
      // ORDENAR OS REGISTROS PELA COLUNA 'NOMESITUACAO' NA FORMA CRESCENTE
      order: [['nomeSituacao', 'ASC']]
    });

    // ACESSA O IF QUANDO ENCONTRAR SITUAÇÕES NO BD E ATRIBUI PARA VARIÁVEL ENVIAR DADOS PARA O FORM.
    if (situations) {
      dataForm['situations'] = situations;
    }

    // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL ITEM DE MENU DEVE FICAR ATIVO.
    res.render('admin/noticias/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarNoticias: true });
  } else {
    // CRIAR A MENSAGEM DE ERRO
    req.flash("danger_msg", "ERRO: Nóticia não encontrada!");
    // REDIRECIONAR O USUÁRIO
    res.redirect('/noticias?page=1')
  }
});

// Criar a rota para receber os dados do formulário editar usuário
router.post('/edit', eAdmin, async (req, res) => {
  // Receber os dados do formulário
  var data = req.body;
  // Início enviar dados para o formulário
  // Enviar dados para o formulário
  var dataForm = req.body;

  // Recuperar as situações do banco de dados
  const situations = await db.situations.findAll({
    // Indicar quais colunas recuperar
    attributes: ['id', 'nomeSituacao'],

    // Ordenar os registros pela coluna nomesituacao na forma crescente
    order: [['nomeSituacao', 'ASC']]
  });

  // Acessa o IF quando encontrar situações no banco de dados e atribui para variável enviar dados para o formulário
  if (situations) {
    dataForm['situations'] = situations;
  }

  // Recuperar a situação do banco de dados
  const situation = await db.situations.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id', 'nomeSituacao'],

    // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
    where: {
      id: data.situationId
    },

    // Ordenar os registros pela coluna nomesituacao na forma crescente
    order: [['nomeSituacao', 'ASC']]
  });

  // Acessa o IF quando encontrar a situação selecionada pelo usuário no formulário no banco de dados e atribui para variável enviar dados para o formulário
  if (situation) {
    dataForm['situation'] = situation;
  }
  // Fim enviar dados para o formulário  

  // Validar os campos utilizando o yup
  const schema = yup.object().shape({
    id: yup.string("Erro: Preenchimento incorreto do formulario!")
      .required("Erro: Preenchimento incorreto do formulario!"),
    situationId: yup.string("Erro: Necessário preencher o campo situação!")
      .required("Erro: Necessário preencher o campo situação!"),
    titulo: yup.string("Erro: Necessário preencher o campo Título!")
      .required("Erro: Necessário preencher o campo Título!"),
    conteudo: yup.string("Erro: Necessário preencher o campo Descrição!")
      .required("Erro: Necessário preencher o campo Descrição!"),
    autor: yup.string("Erro: Necessário preencher o campo Autor!")
      .required("Erro: Necessário preencher o campo Autor!")
  });

  // Verificar se todos os campos passaram pela validação
  try {
    await schema.validate(data);
  } catch (error) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    return res.render("admin/noticias/edit", { layout: 'main', profile: req.noticia.dataValues, sidebarNoticias: true, data: dataForm, danger_msg: error.errors });
  }

  // Recuperar o registro do banco de dados
  const noticia = await db.noticias.findOne({

    // Indicar quais colunas recuperar
    attributes: ['id', 'titulo'],
    // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
    where: {

      titulo: data.titulo,
      id: {
        // Operador de de negação para ignorar o registro do usuário que está sendo editado
        [Op.ne]: data.id
      }
    }
  });

  // Acessa o IF se encontrar o registro no banco de dados
  if (noticia) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    return res.render("admin/noticias/edit", { layout: 'main', profile: req.noticia.dataValues, sidebarNoticias: true, data: dataForm, danger_msg: "Erro: Está notícia já está cadastrada!" });
  }

  // Editar no banco de dados
  db.noticias.update(data, { where: { id: data.id } }).then(() => {
    // Criar a mensagem de usuário editado com sucesso
    req.flash("success_msg", "Notícia editada com sucesso!");
    // Redirecionar o usuário após editar
    //res.redirect('/users?page=1');

    // Redirecionar o usuário após editar para a página visualizar
    res.redirect('/noticias/view/' + data.id);

  }).catch(() => {
    // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
    res.render('admin/noticias/edit', { layout: 'main', profile: req.noticia.dataValues, data: dataForm, sidebarNoticias: true, danger_msg: "Notícia não editada!" });
  });
});

// CRIAR A ROTA PARA PÁGINA COM O FORMULÁRIO EDITAR IMAGEM, USAR A FUNCÃO eAdmin COM MIDDLEWARE PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
router.get('/edit-image/:id', eAdmin, async (req, res) => {
  // RECEBER O ID ENVIADO NA URL
  const idNoticia = req.params.id;

  // Recuperar as situações do banco de dados
  const imagens = await db.imagens.findAll({
    // Indicar quais colunas recuperar
    attributes: ['id', 'noticiaId', ['url', 'urlOld']],

    // ACRESCENTAR CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      noticiaId: idNoticia
    },
  });

  // REALIZAR A INTERAÇÃO SOBRE AS IMAGENS E SALVAR O ARRAY NA CONST
  const imagem = imagens.map(imagens => {
    return {
      id: imagens.dataValues.id,
      url: imagens.dataValues.url,
      urlOld: imagens.dataValues.urlOld,
      noticiaId: imagens.dataValues.noticiaId
    }
  })
  // ACESSA O IF SE ENCONTRAR O REGISTRO NO BD
  if (imagem) {

    // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL ITEM DE MENU DEVE FICAR ATIVO.
    res.render('admin/noticias/edit-image', { layout: 'main', profile: req.user.dataValues, sidebarNoticias: true, imagem: imagem, idNoticia });
  } else {
    // CRIAR A MENSAGEM DE ERRO
    req.flash("danger_msg", "ERRO: Imagem não encontrada!");
    // REDIRECIONAR PARA O LISTAR
    res.render('admin/noticias/edit-image', { latout: 'main', profile: req.user.dataValues, sidebarNoticias: true, imagem: {} })
  }
});

// CRIAR A ROTA PARA RECEBER OS DADOS DO FORM EDITAR IMAGEM DO USUÁRIO, USAR A FUNÇÃO eAdmin COM MIDDLEWARE PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
router.post('/edit-image', uploads.array('image'), eAdmin, async (req, res) => {
  try {
    // Receber os dados do form.
    const { idNoticia } = req.body;

    // Iniciar uma transação para garantir que todas as operações sejam executadas ou revertidas juntas.
    await db.sequelize.transaction(async (t) => {
      // Excluir os registros das imagens do banco de dados.
      await db.imagens.destroy({
        where: {
          noticiaId: idNoticia,
        },
        transaction: t,
      });

      // Excluir os arquivos de imagem físicos do sistema de arquivos.
      const imagens = await db.imagens.findAll({
        attributes: ['url'],
        where: {
          noticiaId: idNoticia,
        },
        transaction: t,
      });

      imagens.forEach((imagem) => {
        const imgOld = `./public/images/news/${imagem.url}`;
        fs.unlink(imgOld, (err) => {
          if (err) {
            console.error(err);
          }
        });
      });
    });

    // Retornar uma resposta JSON indicando que a exclusão foi bem-sucedida.
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    // Retornar uma resposta JSON indicando que a exclusão falhou.
    return res.status(500).json({ success: false });
  }
});

// CRIAR A ROTA PARA PÁGINA COM O FORMULÁRIO SALVAR IMAGEM, USAR A FUNCÃO eAdmin COM MIDDLEWARE PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
router.get('/add-image/:id', eAdmin, async (req, res) => {
  // RECEBER O ID ENVIADO NA URL
  const idNoticia = req.params.id;
  res.render('admin/noticias/add-image', { layout: 'main', profile: req.user.dataValues, sidebarNoticias: true, idNoticia });
});

// CRIAR A ROTA PARA PÁGINA
router.post('/add-image', uploads.array('images', 5), eAdmin, async (req, res) => {

  const { body, files } = req;

  //pega os nomes certinho
  const images = files.map(file => ({ filename: file.filename }));
  const idNoticia = body.idNoticia;

  const transaction = await db.sequelize.transaction();

  try {
    for (const imagem of images) {
      const novaImagem = {
        url: imagem.filename,
        noticiaId: idNoticia,
      };
      await db.imagens.create(novaImagem, { transaction });
      console.log(novaImagem)
    }
    await transaction.commit();
    console.log("Imagens Salvas com Sucesso! ");
  } catch (error) {
    await transaction.rollback();
    console.log("Erro ao salvar imagens:", error);
  }

});

// CRIAR A ROTA APAGAR O USUÁRIO NO BD, USAR A FUNCÃO eAdmin com middleware para verificar se o usuário está logado
router.get('/delete/:id', async (req, res) => {

  // RECUPERAR O REGISTRO NO BD.
  const noticia = await db.noticias.findOne({
    // INDICAR QUAIS COLUNAS RECUPERAR
    attributes: ['id'],

    // ACRESCENTAR CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      id: req.params.id
    }
  });

  // VERIFICAR SE O USUÁRIO TEM IMAGEM SALVA NO BD.
  if (noticia.dataValues.image) {
    // CRIAR O CAMINHO DA IMAGEM QUE O USUÁRIO TEM NO BD.
    var imgOld = "./public/images/news/" + noticia.dataValues.image;

    // fs.access usado para testar as permissões do arquivo
    fs.access(imgOld, (err) => {
      // ACESSA O IF QUANDO NÃO TIVER NENHUM ERRO
      if (!err) {
        // APAGAR A IMAGEM ANTIGA
        fs.unlink(imgOld, () => { })
      }
    });
  }

  db.noticias.destroy({
    // ACRESCENTAR O WHERE NA INSTRUÇÃO SQL INDICANDO QUAL REGISTRO EXCLUIR NO BD.
    where: {
      id: req.params.id
    }
  }).then(() => {
    // CRIAR A MENSAGEM DE USUÁRIO APAGADO COM SUCESSO
    req.flash("success_msg", "Notícia apagada com sucesso!");
    // REDIRECIONAR O USUÁRIO APÓS APAGAR COM SUCESSO
    res.redirect('/noticias?page=1');
  }).catch(() => {
    // CRIAR A MENSAGEM DE ERRO
    req.flash("danger_msg", "ERRO: Notícia não deletado! ");
    // REDIRECIONAR O USUÁRIO APÓS ERRO NA EXCLUSÃO.
    res.redirect('/noticias/view' + req.params.id);
  })
})

//EXPORTAR A INSTRUÇÃO QUE ESTÁ DENTRO DA CONSTANTE ROUTER
module.exports = router;