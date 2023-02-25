// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('../db/models');
// Criptografar senha
const bcrypt = require('bcryptjs');
// Validar input do formulário
const yup = require('yup');
// Enviar e-mail
const nodemailer = require('nodemailer');

// CRIAR A ROTA PARA PÁGINA COM FORMULÁRIO NOVA SENHA
router.get('/', (req, res) => {
    res.render("admin/login/recover-password", { layout: 'login' });
});

// CRIAR A ROTA PARA PÁGINA RECEBER OS DADOS DO FORMULÁRIO NOVO LINK RECUPERAR SENHA
router.post('/recover-password', async (req, res) => {
    // RECEBER OS DADOS DO FORM.
    var data = req.body;
    // RECUPERAR O REGISTRO DO BANCO DE DADOS.
    const user = await db.users.findOne({
        // INDICAR QUAIS COLUNAS RECUPERAR.
        attributes: ['id', 'nome'],
        // ACRESCENTANDO CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER RETORNADO DO BD
        where: {
            email: data.email
        }
    });

    // ACESSA O IF SE ENCONTRAR O REGISTRO NO BD.
    if (user) {
        // GERAR A CHAVE PARA RECUPERAR A SENHA.
        var recoverPassword = (await bcrypt.hash(data.email, 8)).replace(/\./g, "").replace(/\//g, "");

        // EDITAR O REGISTRO NO BD
        await db.users.update({ recoverPassword: recoverPassword }, {
            where: { id: user.id }
        }).then(() => {
            // Criar a variável com as credenciais do servidor para enviar e-mail
            var transport = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            // Criar a variável com o conteúdo do e-mail
            var message_content = {
                from: process.env.EMAIL_PASS, // Rementent
                to: data.email, // E-mail do destinatário
                subject: "Recuperar senha", // Título do e-mail
                text: "Prezado(a) " + user.nome + 
                "\n\nInformamos que a sua solicitação de alteração de senha foi recebida com sucesso.\n\nClique no link abaixo para criar uma nova senha em nosso sistema: " 
                + process.env.URL_ADM + "/recover-password/update-password/" + recoverPassword + " \n\nEsta mensagem foi enviada a você pela empresa " 
                + process.env.NAME_EMP + " .<br>Você está recebendo porque está cadastrado no banco de dados da empresa " 
                + process.env.NAME_EMP + ". Nenhum e-mail enviado pela empresa " + process.env.NAME_EMP + " tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.\n\n", // Conteúdo do e-mail somente texto
                html: "Prezado(a) " + user.nome + 
                "<br><br>Informamos que a sua solicitação de alteração de senha foi recebida com sucesso.<br><br>Clique no link abaixo para criar uma nova senha em nosso sistema: <a href='" + 
                process.env.URL_ADM + "/recover-password/update-password/" + recoverPassword + "'>" 
                + process.env.URL_ADM + "/recover-password/update-password/" + recoverPassword + "</a> <br><br>Esta mensagem foi enviada a você pela empresa " 
                + process.env.NAME_EMP + ".<br>Você está recebendo porque está cadastrado no banco de dados da empresa " + process.env.NAME_EMP + 
                ". Nenhum e-mail enviado pela empresa " + process.env.NAME_EMP + " tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.<br><br>", // Conteúdo do e-mail com HTML
            }

            // Enviar e-mail
            transport.sendMail(message_content, function (err) {
                if (err) {
                    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
                    return res.render("admin/login/recover-password", { layout: 'login', data: req.body, warning_msg: "Erro: E-mail com as intruções para recuperar a senha não enviado, tente novamente ou entre em contato com o e-mail: " + process.env.EMAIL_ADM });
                } else {
                    // Criar a mensagem de novo link recuperar senha
                    req.flash("success_msg", "Enviado e-mail com instruções para recuperar a senha. Acesse a sua caixa de e-mail para recuperar a senha!");
                    // Redirecionar o usuário após cadastrar com sucesso
                    res.redirect('/login');
                }
            });

        }).catch(() => {
            // PAUSAR O PROCESSAMENTO E CARREGAR A VIEW ENVIANDO OS DADOS QUE O USUÁRIO HAVIA
            // PREENCHIDO NO FORMULÁRIO.
            return res.render("admin/login/recover-password", {
                layout: 'login',
                data: req.body, danger_msg: "ERRO: Novo link não enviado, ente em contato com suporte: " + process.env.EMAIL_ADM
            });
        })
    } else {
        // PAUSAR O PROCESSAMENTO E CARREGAR A VIEW ENVIANDO OS DADOS QUE O USUÁRIO HAVIA
        // PREENCHIDO NO FORMULÁRIO.
        return res.render("admin/login/recover-password", {
            layout: 'login',
            data: req.body, danger_msg: "ERRO: Nenhum usuário encontrado com esse e-mail!"
        });
    }
});

// CRIAR A ROTA PARA PÁGINA COM FORMULÁRIO ATUALIZAR A SENHA
router.get('/update-password/:key', async (req, res) => {
    const { key } = req.params;

    // RECUPERAR O REGISTRO DO BD
    const user = await db.users.findOne({
        // INDICAR QUAIS COLUNAS RECUPERAR
        attributes: ['id'],
        // ACRESCENTAR CONDIÇÃO PARA INDICAR QUAL REGISTRO RETORNAR DO BD
        where: {
            recoverPassword: key
        }
    });

    // ACESSA O IF SE ENCONTRAR O REGISTRO NO BD
    if (user) {
      res.render("admin/login/update-password", {layout: 'login', data: {id: user.id, key}});
    } else {
        // CRIAR A MENSAGEM DE ERRO
        req.flash("danger_msg", "Erro: Link inválido, solicite um novo link <a href='/recover-password'>clique aqui</a>!");
        // REDIRECIONAR O USUÁRIO
        res.redirect('/login');
    }
});

// Criar a rota para receber os dados do formulário atualizar senha
router.post('/update-password', async (req, res) => {

    // Receber os dados do formulário
    var data = req.body;

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({
        key: yup.string("Erro: Necessário solicitar novo link para atualizar a senha, solicite novo link <a href='/recover-password'>clique aqui</a>.")
            .required("Erro: Necessário solicitar novo link para atualizar a senha, solicite novo link <a href='/recover-password'>clique aqui</a>."),
        id: yup.string("Erro: Necessário solicitar novo link para atualizar a senha, solicite novo link <a href='/recover-password'>clique aqui</a>.")
            .required("Erro: Necessário solicitar novo link para atualizar a senha, solicite novo link <a href='/recover-password'>clique aqui</a>."),
        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!"),
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/login/update-password", { layout: 'login.handlebars', data, danger_msg: error.errors });
    }

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'email'],
        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            recoverPassword: data.key
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {

        //Criptografar a senha
        var password = await bcrypt.hash(data.password, 8);

        // Editar o registro no banco de dados
        await db.users.update({ recoverPassword: null, password }, {
            where: { id: user.id }
        }).then(() => {
            // Criar a mensagem de sucesso
            req.flash('success_msg', 'Senha editada com sucesso!');
            // Redirecionar o usuário
            res.redirect('/login');
        }).catch(() => {
            // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
            return res.render("admin/login/update-password", { layout: 'login.handlebars', data, danger_msg: "Erro: Senha não editada com sucesso!" });
        });

    } else {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/login/update-password", { layout: 'login.handlebars', data, danger_msg: "Erro: Necessário solicitar novo link para atualizar a senha, solicite novo link <a href='/recover-password'>clique aqui</a>." });
    }

});

// Exportar a instrução que está dentro da constante router 
module.exports = router;
