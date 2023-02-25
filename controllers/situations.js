// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Arquivo com a funcionalidade para verificar se o usuário está logado
const { eAdmin } = require("../helpers/eAdmin");
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('../db/models');
// Validar input do formulário
const yup = require('yup');

// Criar a rota do listar situação, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/', eAdmin, async (req, res) => {
    // Receber o número da página, quando não é enviado o número da página é atribuido página 1
    const { page = 1 } = req.query;
    // Limite de registros em cada página
    const limit = 40;
    // Variável com o número da última página
    var lastPage = 1;

    // Contar a quantidade de registro no banco de dados
    const countSituation = await db.situations.count();

    // Acessa o IF quando encontrar registro no banco de dados
    if (countSituation !== 0) {
        // Calcular a última página
        lastPage = Math.ceil(countSituation / limit);
    } else {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        return res.render("admin/situations/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhuma situação encontrada!' });
    }

    // Recuperar todas as situações do banco de dados
    await db.situations.findAll({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nomeSituacao'],
        // Ordenar os registros pela coluna id na forma decrescente
        order: [['id', 'DESC']],
        // Calcular a partir de qual registro deve retornar e o limite de registros
        offset: Number((page * limit) - limit),
        limit: limit
    }).then((situations) => {
        // Acessa o IF quando retornar registro do banco de dados
        if (situations.length !== 0) {
            // Criar objeto com as informações para paginação
            var pagination = {
                // Caminho
                path: '/situations',
                // Página atual
                page,
                // URL da página anterior
                prev_page_url: ((Number(page) - Number(1)) >= 1) ? Number(page) - Number(1) : false,
                // URL da próxima página
                next_page_url: ((Number(page) + Number(1)) > Number(lastPage)) ? false : Number(page) + Number(1),
                // última página
                lastPage
            }
            // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar os registros retornado do banco de dados 
            res.render("admin/situations/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, situations: situations.map(id => id.toJSON()), pagination });
        } else {
            // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
            res.render("admin/situations/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhuma situação encontrada!' });
        }

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        res.render("admin/situations/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhuma situação encontrada!' });
    })
});

// Criar a rota para página visualizar os detalhes do registro, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/view/:id', eAdmin, async (req, res) => {

    // Receber o id enviado na URL
    const { id } = req.params;

    // Recuperar o registro do banco de dados
    const situation = await db.situations.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nomeSituacao', 'createdAt', 'updatedAt'],
        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (situation) {
        res.render("admin/situations/view", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, situation });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Situação não encontrada!");
        // Redirecionar o usuário
        res.redirect('/situations');
    }
});

// Criar a rota para página com formulário cadastrar situação, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/add', eAdmin, (req, res) => {

    // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
    res.render('admin/situations/add', { layout: 'main', profile: req.user.dataValues, sidebarSituations: true });

});

// Criar a rota para receber os dados do formulário cadastrar situação
router.post('/add', eAdmin, async (req, res) => {

    // Receber os dados do formulário
    var data = req.body;

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({

        nomeSituacao: yup.string("Erro: Necessário preencher o campo nome!")
            .required("Erro: Necessário preencher o campo nome!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/situations/add", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, data, danger_msg: error.errors });
    }

    // Cadastrar no banco de dados
    db.situations.create(data).then(() => {
        // Criar a mensagem de situação cadastrado com sucesso, e-mail enviado
        req.flash("success_msg", "Situação cadastrada com sucesso!");
        // Redirecionar o usuário após cadastrar com sucesso
        res.redirect('/situations?page=1');
    }).catch(() => {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/situations/add", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, data: req.body, danger_msg: "Erro: Situação não cadastrada com sucesso!" });
    });
});

// Criar a rota para página com formulário editar situação, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/edit/:id', eAdmin, async (req, res) => {

    // Receber o id enviado na URL
    const { id } = req.params;

    // Recuperar o registro do banco de dados
    const situation = await db.situations.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'nomeSituacao'],
        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (situation) {
        // Enviar dados para o formulário
        var dataForm = situation.dataValues;

        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('admin/situations/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarSituations: true });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Situação não encontrado!");
        // Redirecionar o usuário
        res.redirect('/situations?page=1');
    }
});

// Criar a rota para receber os dados do formulário editar situação, usar a função eAdmin com middleware para verificar se o usuário está logado
router.post('/edit', eAdmin, async (req, res) => {
    // Receber os dados do formulário
    var data = req.body;

    // Enviar dados para o formulário
    var dataForm = req.body;

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({

        nomeSituacao: yup.string("Erro: Necessário preencher o campo nome!")
            .required("Erro: Necessário preencher o campo nome!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/situations/edit", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, data: dataForm, danger_msg: error.errors });
    }

    // Editar no banco de dados
    db.situations.update(data, { where: {id: data.id} }).then(() => {
        // Criar a mensagem de situação editado com sucesso
        req.flash("success_msg", "Situação editado com sucesso!");
        // Redirecionar o usuário após editar
        //res.redirect('/situations?page=1');

        // Redirecionar o usuário após editar para a página visualizar
        res.redirect('/situations/view/' + data.id);

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('admin/situations/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarSituations: true, danger_msg: "Situação não editada com sucesso!" });
    });
});

// Criar a rota apagar situação no BD, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/delete/:id', async (req, res) => {
    // Recuperar o registro do banco de dados para verificar se a situação está sendo utilizada por algum usuário
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id'],
        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            situationId: req.params.id
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        // Criar a mensagem de situação não apagada
        req.flash("danger_msg", "A situação não pode ser apagada, há usuário utilizando essa situação!");

        // Redirecionar o usuário após não apagar
        //res.redirect('/situations?page=1');
        return res.redirect('/situations/view/' + req.params.id);
    }

    // Apagar usuário no banco de dados utilizando a MODELS situations
    db.situations.destroy({
        // Acrescentar o WHERE na instrução SQL indicando qual registro excluir no BD
        where: {
            id: req.params.id
        }
    }).then(() => {
        // Criar a mensagem de situação apagada com sucesso
        req.flash("success_msg", "Situação apagada com sucesso!");

        // Redirecionar o usuário após apagar com sucesso
        res.redirect('/situations?page=1');
    }).catch(() => {
        // Criar a mensagem de situação não apagada
        req.flash("danger_msg", "Situação não apagada com sucesso!");

        // Redirecionar o usuário após não apagar
        //res.redirect('/situations?page=1');
        res.redirect('/situations/view/' + req.params.id);
    })
});

// Exportar a instrução que está dentro da constante router 
module.exports = router;
