// INCLUIR O ARQUIVO COM AS VARIÁVEIS DE AMBIENTE.
require('dotenv').config();

// INCLUIR AS BIBLIOTECAS.
// GERENCIAR AS REQUISIÇÕES ROTAS e URLs, ENTRE OUTRAS FUNCIONALIDADES.
const express = require('express');
// HANDLEBARS É UM PROCESSADOR DE TEMPLATES HTML.
const { engine } = require('express-handlebars');
// INCLUIR O MÓDULO PARA GERENCIAR DIRETÓRIOS E CAMINHOS.
const path = require('path');
// CRIAR SESSÃO E ARMAZENAR DADOS NO SERVIDOR.
const session = require('express-session');
// CRIAR A VARIAVEL GLOBAL DENTRO DO FLASH.
const flash = require('connect-flash');
// MIDDLEWARE PARA A IMPLEMENTAÇÃO DE AUTENTICAÇÃO
const passport = require('passport');
// CHAMAR A FUNÇÃO RESPONSÁVEL EM VALIDAR O USUÁRIO E SENHA
require('./helpers/auth')(passport);
// MOMENT É UTILIZADO PARA MANIPULAR DATAS
const moment = require('moment');
//CHAMAR A FUNCÃO EXPRESS
const app = express();

// CRIAR O MIDDLEWARE PARA LER A ENTRADA DE UM FORMULÁRIO E ARMAZENAR COMO UM
// OBJETO JAVASCRIPT ACESSÍVEL POR MEIO DO req.body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CRIAR UM MIDDLEWARE PARA MANIPULAR SESSÃO
app.use(session({
  secret: process.env.SECRETSESSION,
  resave: false,
  saveUninitialized: true
}));

// INCIALIZAR O PASSPORT E A SESSÃO
app.use(passport.initialize());
app.use(passport.session());

// USAR O FLASH PARA ARMAZENAR MENSAGENS NA SESSÃO
app.use(flash());
// CRIAR O MIDDLEWARE PARA MANIPULAR AS MENSAGENS
app.use((req, res, next) => {
  // LOCALS USADO PARA CRIAR VARIÁVEL GLOBAL 'success_msg'
  res.locals.success_msg = req.flash('success_msg');
  // LOCALS USADO PARA CRIAR VARIÁVEL GLOBAL 'warning_msg'
  res.locals.warning_msg = req.flash('warning_msg');
  // LOCALS USADO PARA CRIAR VARIÁVEL GLOBAL 'danger_msg'
  res.locals.danger_msg = req.flash('danger_msg');
  // locals usado para criar variável global "error_msg"
  res.locals.error_msg = req.flash('error');
  // CASO NÃO DE ERRO, CONTINUE O PROCESSAMENTO, O NEXT É OBRIGATÓRIO NO 
  // MIDDLEWARE
  next();
});

//DEFINIR QUAL TEMPLATE SERÁ UTILIZADO
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

//LOCAL DOS ARQUIVOS ESTÁTICOS
app.use(express.static(path.join(__dirname, "public")));

//CRIAR UM MIDDLEWARE PARA MANIPULAR DATAS UTILIZANDO O MOMENT
app.engine('handlebars', engine({
  helpers: {
    formatDate: (date) => {
      return moment(date).format('DD/MM/YYYY');
    },
    fotmatDateTime: (date) => {
      return moment(date).format('DD/MM/YYYY HH:mm:ss');
    }
  }
}));

//INCLUIR OS CONTROLLERS
const home = require('./controllers/home');
const login = require('./controllers/login');
const newUser = require('./controllers/newUser');
const confEmail = require('./controllers/confEmail');
const recoverPassword = require('./controllers/recoverPassword');
const dashboard = require('./controllers/dashboard');
const users = require('./controllers/users');
const situations = require('./controllers/situations');
const noticias = require('./controllers/noticias');
const profile = require('./controllers/profile');


// INDICAR A ROTA DE ACESSO
app.use('/', home);
app.use('/login', login);
app.use('/login/logout', login);
app.use('/new-user', newUser);
app.use('/new-user/add-user', newUser);
app.use('/conf-email', confEmail);
app.use('/conf-email/new-conf-email', confEmail);
app.use('/recover-password', recoverPassword);
app.use('/recover-password/update-password', recoverPassword);

app.use('/dashboard', dashboard);

app.use('/users', users);
app.use('/users/view', users);
app.use('/users/add', users);
app.use('/users/edit', users);
app.use('/users/edit-password', users);
app.use('/users/edit-image', users);
app.use('/users/delete', users);

app.use('/situations', situations);
app.use('/situations/view', situations);
app.use('/situations/add', situations);
app.use('/situations/edit', situations);

app.use('/noticias', noticias);
app.use('/noticias/view', noticias);

app.use('/profile', profile);
app.use('/profile/edit', profile);
app.use('/profile/edit-password', profile);
app.use('/profile/edit-image', profile);


//INICIAR O SERVIDOR NA PORTA 8080
// app.listen(8080, () => {
//   console.log("SERVIDOR INICIADO NA PORTA 8080: http://localhost:8080");
// });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>   console.log("SERVIDOR INICIADO NA PORTA 8080: http://localhost:8080"));
