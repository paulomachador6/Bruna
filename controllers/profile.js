// INCLUIR AS BIBLIOTECAS
// GERENCIAR AS REQUISIÇÕES ROTAS e URLs, ENTRE OUTRAS FUNCIONALIDADES.
const express = require('express');
// UTILIZANDO PARA MANIPULAR AS ROTAS DA APLICAÇÃO.
const router = express.Router();
// ARQUIVO COM A FUNCIONALIDADE PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
const { eAdmin } = require("../helpers/eAdmin");
// INCLUIR O ARQUIVO QUE POSSUI A CONEXÃO COM BD.
const db = require("../db/models");
// Criptografar senha
const bcrypt = require('bcryptjs');
// Validar input do formulário
const yup = require('yup');
// Operador do sequelize 
const { Op } = require("sequelize");
// INCLUIR O ARQUIVO COM A FUNÇÃO DE UPLOAD
const upload = require('../helpers/uploadImgUser');
// O módulo fs permite interagir com o sistema de arquivos
const fs = require('fs');

//CRIAR A ROTA DO LISTAR USUÁRIOS, USAR A FUNÇÃO eAdmin COM MIDDLEWARE PARA
//VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
router.get('/', eAdmin, async (req, res) => {

  //console.log(req.user.dataValues.id)
 // console.log(req.user.dataValues)

  //RECUPERAR O REGISTRO DO BD.
  const user = await db.users.findOne({
    //INDICAR QUAIS COLUNAS RECUPERAR
    attributes: ['id', 'nome', 'email', 'image', 'situationId', 'createdAt'],
    //ACRESCENTAR CONDICÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      id: req.user.dataValues.id
    },
    //BUSCAR DADOS NA TABELA SECUNDÁRIA
    include: [{
      model: db.situations,
      attributes: ['nomeSituacao']
    }]
  });

  //ACESSA O IF SE ENCONTRAR O REGISTRO NO BD.
  if (user) {
    res.render("admin/profile/view", { layout: 'main', profile: req.user.dataValues, user });
  } else {
    //CRIAR A MENSAGEM DE ERRO
    req.flash("danger_msg", "ERRO: Usuário não encontrado!");
    //REDIRECIONAR O USUÁRIO
    res.redirect('/login');
  }
});

router.get('/edit', eAdmin, async (req, res) => {
  // Recuperar o registro do banco de dados
  const user = await db.users.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id', 'nome', 'email'],
    // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
    where: {
      id: req.user.dataValues.id
    }
  });
  // Acessa o IF se encontrar o registro no banco de dados
  if (user) {
    // Enviar dados para o formulário
    var dataForm = user.dataValues;

    // Pausar o processamento, carregar a view, carregar o layout main e envia os dados para o formulário
    res.render('admin/profile/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm });
  } else {
    // Criar a mensagem de erro
    req.flash("danger_msg", "Erro: Usuário não encontrado!");
    // Redirecionar o usuário
    res.redirect('/login');
  }
});

// Criar a rota para receber os dados do formulário editar dados do perfil, usar a função eAdmin com middleware para verificar se o usuário está logado
router.post('/edit', eAdmin, async (req, res) => {
  // Receber os dados do formulário
  var data = req.body;

  // Enviar dados para o formulário
  var dataForm = req.body;

  // Validar os campos utilizando o yup
  const schema = yup.object().shape({
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
    return res.render("admin/profile/edit", { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: error.errors });
  }

  // Recuperar o registro do banco de dados
  const user = await db.users.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id', 'email'],
    // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
    where: {
      email: data.email,
      id: {
        // Operador de negação para ignorar o registro do usuário que está sendo editado
        [Op.ne]: req.user.dataValues.id
      }
    }
  });

  // Acessa o IF se encontrar o registro no banco de dados
  if (user) {
    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
    return res.render("admin/profile/edit", { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: "Erro: Este e-mail já está cadastrado!" });
  }

  // Editar no banco de dados
  db.users.update(data, { where: { id: req.user.dataValues.id } }).then(() => {

    // ALTERAR AS INFORMAÇÕES NA SESSÃO
    req.user.dataValues.nome = data.nome;
    req.user.dataValues.email = data.email;

    // Criar a mensagem de perfil editado com sucesso
    req.flash("success_msg", "Perfil editado com sucesso!");

    // Redirecionar o usuário após editar para a página perfil
    res.redirect('/profile');

  }).catch(() => {
    // Pausar o processamento, carregar a view, carregar o layout main
    res.render('admin/profile/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: "Perfil não editado com sucesso!" });
  });
});

// Criar a rota para página com formulário editar senha do perfil, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/edit-password', eAdmin, async (req, res) => {

  // Recuperar o registro do banco de dados
  const user = await db.users.findOne({
    // Indicar quais colunas recuperar
    attributes: ['id'],
    // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
    where: {
      id: req.user.dataValues.id
    }
  });

  // Acessa o IF se encontrar o registro no banco de dados
  if (user) {

    // Pausar o processamento, carregar a view, carregar o layout main
    res.render('admin/profile/edit-password', { layout: 'main', profile: req.user.dataValues });
  } else {
    // Criar a mensagem de erro
    req.flash("danger_msg", "Erro: Usuário não encontrado!");
    // Redirecionar o usuário
    res.redirect('/login');
  }
});

// Criar a rota para receber os dados do formulário editar senha, usar a função eAdmin COM MIDDLEWARE PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
router.post('/edit-password', eAdmin, async (req, res) => {
  // Receber os dados do formulário
  var data = req.body;

  // Enviar dados para o formulário
  var dataForm = [];
  var password = data['password'];

  // Validar os campos utilizando o yup
  const schema = yup.object().shape({
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
    return res.render("admin/profile/edit-password", { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: error.errors });
  }

  //Criptografar a senha
  data.password = await bcrypt.hash(data.password, 8);

  // Editar no banco de dados
  db.users.update(data, { where: { id: req.user.dataValues.id } }).then(() => {
    // Criar a mensagem de senha editada com sucesso
    req.flash("success_msg", "Senha editada com sucesso!");

    // Redirecionar o usuário após editar para a página perfil
    res.redirect('/profile');

  }).catch(() => {
    // Pausar o processamento, carregar a view, carregar o layout main
    res.render('admin/profile/edit-password', { layout: 'main', profile: req.user.dataValues, danger_msg: "Senha não editada com sucesso!" });
  });

});

// CRIAR A ROTA PARA PÁGINA COM O FORM EDITAR FOTO DE PERFIL, USAR A FUNCÃO eAdmin COM MIDDLEWARE PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
router.get('/edit-image', eAdmin, async (req, res) => {

  // Recuperar o registro do banco de dados
  const user = await db.users.findOne({
      // Indicar quais colunas recuperar
      attributes: ['id', 'nome', ['image', 'imageOld']],
      // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
      where: {
          id: req.user.dataValues.id
      }
  });

  // Acessa o IF se encontrar o registro no banco de dados
  if (user) {
      // Enviar dados para o formulário
      var dataForm = user.dataValues;

      // Pausar o processamento, carregar a view, carregar o layout main
      res.render('admin/profile/edit-image', { layout: 'main', profile: req.user.dataValues, data: dataForm });
  } else {
      // Criar a mensagem de erro
      req.flash("danger_msg", "Erro: Usuário não encontrado!");
      // Redirecionar o usuário
      res.redirect('/login');
  }
});

// CRIAR A ROTA PARA RECEBER OS DADOS DO FORMULÁRIO EDITAR FOTO, USAR A FUNÇÃO eAdmin COM MIDDLEWARE PARA VERIFICAR SE O USUÁRIO ESTÁ LOGADO.
router.post('/edit-image', eAdmin, upload.single('image'), async (req, res) => {
  // ACESSA O IF QUANDO A EXTENSÃO DA IMAGEM É VÁLIDA.
  if (!req.file) {
    // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL ITEM DE MENU DEVE FICAR ATIVO.
    return res.render('admin/profile/edit-image', { layout: 'main', profile: req.user.dataValues, danger_msg: "ERRO: Selecione uma foto válida JPEG ou PNG!" });
  }

  // RECUPERAR O REGISTRO DO BD
  const user = await db.users.findOne({
    // INDICAR QUAIS COLUNAS RECUPERAR
    attributes: ['id', 'image'],

    // ACRESCENTAR CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD.
    where: {
      id: req.user.dataValues.id
    }
  });

      // VERIFICAR SE O USUÁRIO TEM IMAGEM SALVA NO BD.
      if (user.dataValues.image) {
        // CRIAR O CAMINHO DA IMAGEM QUE O USUÁRIO TEM NO BD.
        var imgOld = "./public/images/users/" + user.dataValues.image;
  
        // fs.access usado para testar as permissões do arquivo
        fs.access(imgOld, (err) => {
          // ACESSA O IF QUANDO NÃO TIVER NENHUM ERRO.
          if (!err) {
            // APAGAR A IMAGEM ANTIGA
            fs.unlink(imgOld, () => { });
          }
        });
      }

  // EDITAR NO BD.
  db.users.update({ image: req.file.filename }, { where: { id: req.user.dataValues.id } }).then(() => {
    
    // ALTERAR AS INFORMAÇÕES DO USUÁRIO NA SESSÃO
    req.user.dataValues.image = req.file.filename;

    // CRIAR A MENSAGEM DE FOTO EDITADA COM SUCESSO.
    req.flash("success_msg", "Foto editada com sucesso!");

    // REDIRECIONAR O USUÁRIO APÓS EDITAR PARA A PÁGINA PERFIL.
    res.redirect('/profile');
  }).catch(() => {
    // PAUSAR O PROCESSAMENTO, CARREGAR A VIEW, CARREGAR O LAYOUT MAIN, INDICAR QUAL ITEM DE MENU DEVE FICAR ATIVO.
    res.render('admin/profile/eidt-image', { layout: 'main', profile: req.user.dataValues, danger_msg: "ERRO: Foto não editada!" });
  });

});

//EXPORTAR A INSTRUÇÃO QUE ESTÁ DENTRO DA CONSTANTE ROUTER
module.exports = router;