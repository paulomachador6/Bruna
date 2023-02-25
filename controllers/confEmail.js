// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('../db/models');
// Criptografar senha
const bcrypt = require('bcryptjs');
// Enviar e-mail
const nodemailer = require('nodemailer');

// CRIAR A ROTA PARA CONFIRMAR O E-MAIL
router.get('/conf-email/:key', async (req, res) => {
    const { key } = req.params;
    // RECUPERAR O REGISTRO DO BANDO DE DADOS
    const user = await db.users.findOne({
        // INDICAR QUAIS COLUNAS RECUPERAR
        attributes: ['id'],
        // ACRESCENTADO CONDIÇÃO PARA INDICAR QUAL REGISTRO DEVE SER 
        // RETORNADO DO BD.
        where: {
            confEmail: key
        }
    });

    // ACESSA O IF SE ENCONTRAR O REGISTRO NO BANCO DE DADOS
    if (user) {
        // EDITAR O REGISTRO NO BD
        await db.users.update({
            confEmail: null,
            situationId: 1
        }, {
            where: {
                id: user.id
            }
        })
            .then(() => {
                // CRIAR A MENSAGEM DE SUCESSO
                req.flash("success_msg", "E-mail ativado com sucesso!");
                // REDIRECIONAR O USUÁRIO.
                res.redirect('/login');
            }).catch(() => {
                // CRIAR A MENSAGEM DE ERRO
                req.flash("danger_msg", "ERRO: Link inválido, solicite um novo link!");
                // REDIRECIONAR O USUÁRIO.
                res.redirect('/login');
            })
    } else {
        // CRIAR A MENSAGEM DE ERRO
        req.flash("danger_msg", "ERRO: Link inválido, solicite um novo link!");
        // REDIRECIONAR O USUÁRIO.
        res.redirect('/login');
    }
});

// CRIAR A ROTA PARA PÁGINA COM FORMULÁRIO NOVO LINK CONFIRMAR E-MAIL
router.get('/', (req, res) => {
    res.render("admin/login/new-conf-email", { layout: 'login' });
});

// CRIAR A ROTA PARA PÁGINA RECEBER OS DADOS DO FORMULÁRIO NOVO LINK CONFIRMAR E-MAIL
router.post('/new-conf-email', async (req, res) => {
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
        // GERAR A CHAVE PARA CONFIRMAR O E-MAIL.
        var confEmail = (await bcrypt.hash(data.email, 8)).replace(/\./g, "").replace(/\//g, "");

        // EDITAR O REGISTRO NO BD
        await db.users.update({ confEmail }, {
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
                from: process.env.EMAIL_FROM_PASS, // Rementent
                to: data.email, // E-mail do destinatário
                subject: "Confirma sua conta", // Título do e-mail
                text: "Prezado(a) " + user.nome + "\n\nInformamos que a sua solicitação para confirmar o e-mail foi recebido com sucesso.\n\nPara que possamos liberar o seu cadastro em nosso sistema, solicitamos a confirmação do e-mail clicando no link abaixo: " + process.env.URL_ADM + "/conf-email/conf-email/" + confEmail + " \n\nEsta mensagem foi enviada a você pela empresa " + process.env.NAME_EMP + " .<br>Você está recebendo porque está cadastrado no banco de dados da empresa " + process.env.NAME_EMP + ". Nenhum e-mail enviado pela empresa " + process.env.NAME_EMP + " tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.\n\n", // Conteúdo do e-mail somente texto
                html: "Prezado(a) " + user.nome + "<br><br>Informamos que a sua solicitação para confirmar o e-mail foi recebido com sucesso.<br><br>Para que possamos liberar o seu cadastro em nosso sistema, solicitamos a confirmação do e-mail clicando no link abaixo: <a href='" + process.env.URL_ADM + "/conf-email/conf-email/" + confEmail + "'>" + process.env.URL_ADM + "/conf-email/conf-email/" + confEmail + "</a> <br><br>Esta mensagem foi enviada a você pela empresa " + process.env.NAME_EMP + ".<br>Você está recebendo porque está cadastrado no banco de dados da empresa " + process.env.NAME_EMP + ". Nenhum e-mail enviado pela empresa " + process.env.NAME_EMP + " tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.<br><br>", // Conteúdo do e-mail com HTML
            }

            // Enviar e-mail
            transport.sendMail(message_content, function (err) {
                if (err) {
                    // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
                    return res.render("admin/login/new-conf-email", { layout: 'login', data: req.body, warning_msg: "Erro: Novo link não enviado, entre em contato com o suporte: " + process.env.EMAIL_ADM });
                } else {
                    // Criar a mensagem de novo link confirmar e-mail enviado
                    req.flash("success_msg", "Novo link enviado com sucesso. Acesse a sua caixa de e-mail para confimar o e-mail!");
                    // Redirecionar o usuário após cadastrar com sucesso
                    res.redirect('/login');
                }
            });

        }).catch(() => {
            // PAUSAR O PROCESSAMENTO E CARREGAR A VIEW ENVIANDO OS DADOS QUE O USUÁRIO HAVIA
            // PREENCHIDO NO FORMULÁRIO.
            return res.render("admin/login/new-conf-email", {
                layout: 'login',
                data: req.body, danger_msg: "ERRO: Novo link não enviado, ente em contato com suporte: " + process.env.EMAIL_ADM
            });
        })
    } else {
        // PAUSAR O PROCESSAMENTO E CARREGAR A VIEW ENVIANDO OS DADOS QUE O USUÁRIO HAVIA
        // PREENCHIDO NO FORMULÁRIO.
        return res.render("admin/login/new-conf-email", {
            layout: 'login',
            data: req.body, danger_msg: "ERRO: Nenhum usuário encontrado com esse e-mail!"
        });
    }
});

// Exportar a instrução que está dentro da constante router 
module.exports = router;
