// INCLUIR AS BIBLIOTECAS
// GERENCIAR AS REQUISIÇÕES ROTAS e URLs, ENTRE OUTRAS FUNCIONALIDADES.
const express = require('express');
// UTILIZANDO PARA MANIPULAR AS ROTAS DA APLICAÇÃO.
const router = express.Router();
// ARQUIVO COM A FUNCIONALIDADE PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
const { eAdmin } = require("../helpers/eAdmin");
// INCLUIR O ARQUIVO QUE POSSUI A CONEXÃO COM BD.
const db = require("./../db/models");
// Criptografar senha
const bcrypt = require('bcryptjs');
// Validar input do formulário
const yup = require('yup');
// Operador do sequelize 
const { Op } = require("sequelize");
// INCLUIR O ARQUIVO COM A FUNÇÃO DE UPLOAD
const upload = require('../helpers/uploadImgUser');
// O MÓDULO FS PERMITE INTERAGIR COM O SISTEMA DE ARQUIVOS
const fs = require('fs');

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
  const countUser = await db.users.count();
  // ACESSAR O IF QUANDO ENCONTRAR O REGISTRO NO BD
  if (countUser !== 0) {
    // CALCULAR A ÚLTIMA PÁGINA
    lastPage = Math.ceil(countUser / limit);
  } else {
    // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL ITEM DE MENU DEVE FICAR ATIVO, ENVIAR MSG ERRO.
    return res.render("admin/users/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, danger_msg: 'ERRO: Nenhum usuário encontrado!' });
  }
  // RECUPERAR TODOS OS USUÁRIOS DO DB.
  await db.users.findAll({
    // INDICAR QUAIS COLUNAS RECUPERAR
    attributes: ['id', 'nome', 'email'],
    // ORDENAR OS REGISTROS PELA COLUNA ID NA FORMA DECRESCENTE
    order: [['id', 'ASC']],
    // console.log((page * limit) - limit); //2 * 4 = 8 //page 1: 1,2,3,4 - page 2: 5,6,7,8 
    offset: Number((page * limit) - limit),
    limit: limit
  }).then((users) => {
    // ACESSA O IF QUANDO RETORNAR REGISTRO DO BD.
    if (users.length !== 0) {
      var pagination = {
        // CAMINHO.
        path: '/users',
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
      res.render("admin/users/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, users: users.map(id => id.toJSON()), pagination });
    } else {
      // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL ITEM DE MENU DEVE FICAR ATIVO, ENVIAR MSG ERRO.
      res.render("admin/users/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, danger_msg: 'ERRO: Nenhum usuário encontrado!' });
    }
  }).catch(() => {
    // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL ITEM DE MENU DEVE FICAR ATIVO, ENVIAR MSG ERRO.
    res.render("admin/users/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, danger_msg: 'ERRO: Nenhum usuário encontrado!' });
  })
});

// CRIAR A ROTA PARA PÁGINA VISUALIZAR OS DETALHES DO REGISTRO.
router.get('/view/:id', eAdmin, async (req, res) => {
  // RECEBER O ID ENVIADO NA URL.
  const { id } = req.params;
  // RECUPERAR O REGISTRO DO BD.
  const user = await db.users.findOne({
    // INDICAR QUAIS COLUNAS RECUPERAR.
    attributes: ['id', 'nome', 'email', 'image', 'situationId', 'createdAt', 'updatedAt'],
    // ACRESCENTANDO A CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      id
    },
    // BUSCAR DADOS NA TABELA SECUNDÁRIA
    include: [{
      model: db.situations,
      attributes: ['nomeSituacao']
    }]
  });

  // ACESSA O IF SE ENCONTRAR O REGISTRO NO BD.
  if (user) {
    res.render("admin/users/view", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, user });
  } else {
    // CRIAR A MENSAGEM DO ERRO.
    req.flash("danger_msg", "ERRO: Usuário não encontrado!"),
      // REDIRECIONAR O USUÁRIO.
      res.redirect('/users');
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
  res.render('admin/users/add', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true });
});

// CRIAR A ROTA PARA RECEBER OS DADOS DO FORMULÁRIO CADASTRAR USUÁRIO.
router.post('/add', eAdmin, async (req, res) => {

  //RECEBER OS DADOS DO FORMULÁRIO.
  var data = req.body;

  // INICIO ENVIAR DADOS PARA O FORMULÁRIO.
  // ENVIAR DADOS PARA O FORMULÁRIO.
  var dataForm = req.body;
  var password = dataForm['password']

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
    password: yup.string("Erro: Necessário preencher o campo senha!")
      .required("Erro: Necessário preencher o campo senha!")
      .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!"),
    email: yup.string("Erro: Necessário preencher o campo e-mail!")
      .required("Erro: Necessário preencher o campo e-mail!")
      .email("Erro: Necessário preencher o campo e-mail!"),
    nome: yup.string("Erro: Necessário preencher o campo nome!")
      .required("Erro: Necessário preencher o campo nome!")

  });

  // Verificar se todos os campos passaram pela validação
  try {
    await schema.validate(data);
  } catch (error) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    return res.render("admin/users/add", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: error.errors });
  }

  // Recuperar o registro do banco de dados
  const user = await db.users.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id', 'email'],
    // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
    where: {
      email: data.email
    }
  });

  // Acessa o IF se encontrar o registro no banco de dados
  if (user) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    return res.render("admin/users/add", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: "Erro: Este e-mail já está cadastrado!" });
  }

  //Criptografar a senha
  data.password = await bcrypt.hash(data.password, 8);

  // Cadastrar no banco de dados
  db.users.create(data).then((dataUser) => {
    // Criar a mensagem de usuário cadastrado com sucesso
    req.flash("success_msg", "Usuário cadastrado com sucesso!");
    // Redirecionar o usuário após cadastrar 
    //res.redirect('/users?page=1');
    res.redirect('/users/view/' + dataUser.id)
  }).catch(() => {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    dataForm['password'] = password;
    return res.render("admin/users/add", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: "Erro: Usuário não cadastrado com sucesso!" });
  });
})

// CRIAR A ROTA PARA PÁGINA COM FORMULÁRIO EDITAR USUÁRIO.
router.get('/edit/:id', eAdmin, async (req, res) => {

  // RECEBER O ID ENVIADO NA URL
  const { id } = req.params;
  // RECUPERAR O REGISTRO DO BD.
  const user = await db.users.findOne({
    // INDICAR QUAIS COLUNAS RECUPERAR DO BD.
    attributes: ['id', 'nome', 'email', 'situationId'],
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
  if (user) {
    // ENVIAR DADOS PARA O FORMULÁRIO
    var dataForm = user.dataValues;

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
    res.render('admin/users/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true });
  } else {
    // CRIAR A MENSAGEM DE ERRO
    req.flash("danger_msg", "ERRO: Usuário não encontrado!");
    // REDIRECIONAR O USUÁRIO
    res.redirect('/users?page=1')
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
    email: yup.string("Erro: Necessário preencher o campo e-mail!")
      .required("Erro: Necessário preencher o campo e-mail!")
      .email("Erro: Necessário preencher e-mail válido!"),
    nome: yup.string("Erro: Necessário preencher o campo nome!")
      .required("Erro: Necessário preencher o campo nome!")
  });

  // Verificar se todos os campos passaram pela validação
  try {
    await schema.validate(data);
  } catch (error) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    return res.render("admin/users/edit", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: error.errors });
  }

  // Recuperar o registro do banco de dados
  const user = await db.users.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id', 'email'],
    // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
    where: {
      email: data.email,
      id: {
        // Operador de de negação para ignorar o registro do usuário que está sendo editado
        [Op.ne]: data.id
      }
    }
  });

  // Acessa o IF se encontrar o registro no banco de dados
  if (user) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    return res.render("admin/users/edit", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: "Erro: Este e-mail já está cadastrado!" });
  }

  // Editar no banco de dados
  db.users.update(data, { where: { id: data.id } }).then(() => {
    // Criar a mensagem de usuário editado com sucesso
    req.flash("success_msg", "Usuário editado com sucesso!");
    // Redirecionar o usuário após editar
    //res.redirect('/users?page=1');

    // Redirecionar o usuário após editar para a página visualizar
    res.redirect('/users/view/' + data.id);

  }).catch(() => {
    // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
    res.render('admin/users/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true, danger_msg: "Usuário não editado com sucesso!" });
  });
});

// Criar a rota para página com formulário editar senha
router.get('/edit-password/:id', eAdmin, async (req, res) => {

  // Receber o id enviado na URL
  const { id } = req.params;

  // Recuperar o registro do banco de dados
  const user = await db.users.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id'],
    // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
    where: {
      id
    }
  });

  // Acessa o IF se encontrar o registro no banco de dados
  if (user) {
    // Enviar dados para o formulário
    var dataForm = user.dataValues;

    // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
    res.render('admin/users/edit-password', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true });
  } else {
    // Criar a mensagem de erro
    req.flash("danger_msg", "Erro: Usuário não encontrado!");
    // Redirecionar o usuário
    res.redirect('/users?page=1');
  }
});

// Criar a rota para receber os dados do formulário editar usuário
router.post('/edit-password', eAdmin, async (req, res) => {
  // Receber os dados do formulário
  var data = req.body;

  // Enviar dados para o formulário
  var dataForm = req.body;
  var password = data['password'];

  // Validar os campos utilizando o yup
  const schema = yup.object().shape({
    id: yup.string("Erro: Preenchimento incorreto do formulario!")
      .required("Erro: Preenchimento incorreto do formulario!"),
    password: yup.string("Erro: Necessário preencher o campo senha!")
      .required("Erro: Necessário preencher o campo senha!")
      .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!")
  });

  // Verificar se todos os campos passaram pela validação
  try {
    await schema.validate(data);
  } catch (error) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    dataForm['password'] = password;
    return res.render("admin/users/edit-password", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: error.errors });
  }

  //Criptografar a senha
  data.password = await bcrypt.hash(data.password, 8);

  // Editar no banco de dados
  db.users.update(data, { where: { id: data.id } }).then(() => {
    // Criar a mensagem de usuário editado com sucesso
    req.flash("success_msg", "Senha editada com sucesso!");
    // Redirecionar o usuário após editar
    //res.redirect('/users?page=1');

    // Redirecionar o usuário após editar para a página visualizar
    res.redirect('/users/view/' + data.id);

  }).catch(() => {
    // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
    res.render('admin/users/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true, danger_msg: "Senha não editada com sucesso!" });
  });

});

// CRIAR A ROTA PARA PÁGINA COM O FORMULÁRIO EDITAR IMAGEM, USAR A FUNCÃO eAdmin COM MIDDLEWARE PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
router.get('/edit-image/:id', eAdmin, async (req, res) => {
  // RECEBER O ID ENVIADO NA URL
  const { id } = req.params;

  // RECUPERAR O REGISTRO DO BD.
  const user = await db.users.findOne({
    //INDICAR QUAIS COLUNAS RECUPERAR
    attributes: ['id', 'nome', ['image', 'imageOld']],
    // ACRESCENTAR CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      id
    }
  });

  // ACESSA O IF SE ENCONTRAR O REGISTRO NO BD
  if (user) {
    // ENVIAR OS DADOS PARA O FORM.
    var dataForm = user.dataValues;
    // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL ITEM DE MENU DEVE FICAR ATIVO.
    res.render('admin/users/edit-image', { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm });
  } else {
    // CRIAR A MENSAGEM DE ERRO
    req.flash("danger_msg", "ERRO: Imagem não encontrada!");
    // REDIRECIONAR PARA O LISTAR
    res.redirect('/users?page=1');
  }
});

// CRIAR A ROTA PARA RECEBER OS DADOS DO FORM EDITAR IMAGEM DO USUÁRIO, USAR A FUNÇÃO eAdmin COM MIDDLEWARE PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
router.post('/edit-image', eAdmin, upload.single('image'), async (req, res) => {
  // RECEBER OS DADOS DO FORM.
  var data = req.body;

  //ENVIAR DADOS PARA O FORM.
  var dataForm = req.body;

  // ACESSA O IF QUANDO A EXTENSÃO DA IMAGE É VALIDA
  if (!req.file) {
    // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL O ITEM DE MENU DEVE
    // FICAR ATIVO
  return  res.render('admin/users/edit-image', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true, danger_msg: "ERRO: Selecione uma imagem válida JPEG ou PNG!" });
  }

  // RECUPERAR O REGISTRO DO BD.
 const user = await db.users.findOne({
    // INDICAR QUAIS COLUNAS RECUPERAR
    attributes: ['id', 'image'],

    // ACRESCENTAR CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      id: data.id
    }
  });

   // VERIFICAR SE O USUÁRIO TEM IMAGEM SALVA NO BD.
   if (user.dataValues.image) {
    // CRIAR O CAMINHO DA IMAGEM QUE O USUÁRIO TEM NO BD.
    var imgOld = "./public/images/users/" + user.dataValues.image;
    // fs.access usado para testar as permissões do arquivo
    fs.access(imgOld, (err) => {
      // ACESSA O IF QUANDO NÃO TIVER NENHUM ERRO
      if (!err) {
        // APAGAR A IMAGEM ANTIGA
        fs.unlink(imgOld, () => { })
      }
    });
  }

  // EDITAR NO BD.
  db.users.update(
    { image: req.file.filename },
    { where: { id: data.id } })
    .then(() => {
      // CRIAR A MENSAGEM DE SUCESSO
      req.flash("success_msg", "Imagem editada com sucesso!");
      // REDIRECIONAR O USUÁRIO APÓS EDITAR PARA PÁGINA VISUALIZAR
      res.redirect('/users/view/' + data.id);

    }).catch(() => {
      // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL O ITEM DE MENU DEVE
      // FICAR ATIVO
      res.render('admin/users/edit-image', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true, danger_msg: "ERRO: Imagem não editada! " });
    });
});

// CRIAR A ROTA APAGAR O USUÁRIO NO BD, USAR A FUNCÃO eAdmin com middleware para verificar se o usuário está logado
router.get('/delete/:id', async (req, res) => {

  // RECUPERAR O REGISTRO NO BD.
  const user = await db.users.findOne({
    // INDICAR QUAIS COLUNAS RECUPERAR
    attributes: ['id', 'image'],

    // ACRESCENTAR CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      id: req.params.id
    }
  });

  // VERIFICAR SE O USUÁRIO TEM IMAGEM SALVA NO BD.
  if (user.dataValues.image) {
    // CRIAR O CAMINHO DA IMAGEM QUE O USUÁRIO TEM NO BD.
    var imgOld = "./public/images/users/" + user.dataValues.image;

    // fs.access usado para testar as permissões do arquivo
    fs.access(imgOld, (err) => {
      // ACESSA O IF QUANDO NÃO TIVER NENHUM ERRO
      if (!err) {
        // APAGAR A IMAGEM ANTIGA
        fs.unlink(imgOld, () => { })
      }
    });
  }

  db.users.destroy({
    // ACRESCENTAR O WHERE NA INSTRUÇÃO SQL INDICANDO QUAL REGISTRO EXCLUIR NO BD.
    where: {
      id: req.params.id
    }
  }).then(() => {
    // CRIAR A MENSAGEM DE USUÁRIO APAGADO COM SUCESSO
    req.flash("success_msg", "Usuário apagado com sucesso!");
    // REDIRECIONAR O USUÁRIO APÓS APAGAR COM SUCESSO
    res.redirect('/users?page=1');
  }).catch(() => {
    // CRIAR A MENSAGEM DE ERRO
    req.flash("danger_msg", "ERRO: Usuário não deletado! ");
    // REDIRECIONAR O USUÁRIO APÓS ERRO NA EXCLUSÃO.
    res.redirect('/users/view' + req.params.id);
  })
})


//EXPORTAR A INSTRUÇÃO QUE ESTÁ DENTRO DA CONSTANTE ROUTER
module.exports = router;