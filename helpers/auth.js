// Validar o usuário e a senha com dados locais
const localStrategy = require('passport-local').Strategy;
// Criptografar senha
const bcryptjs = require('bcryptjs');
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('../db/models');

module.exports = function (passport) {
    passport.use(new localStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        const user = await db.users.findOne({
            // Indicar quais colunas recuperar
            attributes: ['id', 'password', 'situationId'],
            // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
            where: {
                email
            }
        }).then(async (user) => {
            if (!user) {
                return done(null, false, { message: "Erro: E-mail ou senha incorreta!" });
            }

            bcryptjs.compare(password, user.password, (erro, correct) => {

                // ACESSA O ELSE QUANDO A SITUAÇÃO E DIFERENTE DE ATIVA
                if ((correct) && (user.dataValues.situationId != 1)) {
                    return done(null, false, { message: "Erro: Necessário confirmar o e-mail, solicite novo link <a href='/conf-email'>clique aqui</a>!" });
                } else if (correct) { // ACESSA O ELSE IF QUANDO A SENHA ESTÁ CORRETA.
                    return done(null, user);
                } else { // ACESSA O ELSE QUANDO A SENHA ESTÁ INCORRETA
                    return done(null, false, { message: "Erro: E-mail ou senha incorreta!" })
                }
            });
        });

        // Salvar os dados do usuário na sessão
        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        passport.deserializeUser(async (id, done) => {
            const user = await db.users.findByPk(id, { attributes: ['id', 'nome', 'email', 'image'] });
            done(null, user);
        });
    }));


}