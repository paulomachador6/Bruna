COMO RODAR O PROJETO BAIXADO
INSTALAR TODAS AS DEPENDENCIAS INDICADAS PELO PACKAGE.JSON
### npm install

CRIAR A BASE DE DADOS NO MYSQL
ALTERAR AS CREDENCIAIS DO BD NO ARQUIVO ".env"

EXECUTAR AS MIGRATIONS
### npx sequelize-cli db:migrate

EXECUTAR AS SEEDERS
### npx sequelize-cli db:seed:all

RODAR O PROJETO USANDO O NODEMOM
### nodemon app.js

ABRIR O ENDEREÇO NO NAVEGADOR PARA ACESSAR A PÁGINA INICIAL
### http://localhost:8080/login


SEQUENCIA PARA CRIAR O PROJETO
CRIAR O PACKAGE.JSON.
### npm init

GERENCIA AS REQUESIÇÕES, ROTAS E URLs, ENTRE OUTRAS FUNCIONALIDADES.
### npm install --save express

INSTALAR A DEPENDÊNCIA DE FORMA GLOBAL, "-g" SIGNIFICA GLOBALMENTE. EXECUTAR O
COMANDO ATRAVÉS DO PROMPT DE COMANDO, EXECUTAR SOMENTE SE NUNCA INSTALOU A 
DEPENDÊNCIA NA MAQUINA, APÓS INSTALAR, REINICIAR O PC.
### npm install -g nodemon

INSTALAR A DEPENDÊNCIA COMO DESENVOLVEDOR PARA REINICIAR O SERVIDOR SEMPRE QUE HOUVER
ALTERAÇÃO NO CÓDIGO FONTE.

### npm install --save-dev nodemon

TRABALHAR COM VARIÁVEIS DE AMBIENTE.
### npm install --save dotenv

O HANDLEBARS É UM PROCESSADOR DE TEMPLATES QUE GERA A PÁGINA HTML DE FORMA DINAMICA.
### npm install --save express-handlebars

SEQUELIZE É UMA BIBLIOTECA JAVASCRIPT QUE FACILITA O GERENCIAMENTO DO BANCO DE DADOS SQL.
### npm install --save sequelize

INSTALAR O DRIVE DE CONEXÃO BD.
### npm install --save mysql2

SEQUELIZE-CLI INTERFACE DE LINHA DE COMANDO USADA PARA CRIAR MODELOS, CONFIGURAÇÕES
E ARQUIVOS DE MIGRAÇÃO PARA BD.
### npm install -save-dev sequelize-cli

INICIAR O SEQUELIZE-CLI E CRIAR O ARQUIVO CONFIG
### npx sequelize-cli init

CRIAR A BASE DE DADOS
### CREATE DATABASE bruna CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CRIAR A MIGRATION
### npx sequelize-cli migration:generate --name create-users

EXECUTAR AS MIGRATION
### npx sequelize-cli db:migrate

CRIAR SEEDERS
### npx sequelize-cli seed:generate --name demo-users

EXECUTAR UMA UNICA SEEDERS
### npx sequelize-cli db:seed --seed 20181005185212-create-users.js

EXECUTAR AS SEEDERS
### npx sequelize-cli db:seed:all

INSTALAR O MÓDULO PARA CRIPTOGRAFAR A SENHA
### npm install bcryptjs

RECEBER OS DADOS DO FORMULÁRIO
### npm install --save body-parser

CRIAR A MODELS users
### npx sequelize-cli model:generate --name users --attributes nome:string,email:string,password:string,image:string

### npx sequelize-cli model:generate --name situations --attributes nomesituacao:string

### npx sequelize-cli model:generate --name noticias --attributes titulo:string,subtitulo:string,conteudo:string,status:string

### npx sequelize-cli model:generate --name imagem --attributes url:string

CRIAR SESSÃO E ARMAZENAR DADOS NO SERVIDOR
### npm install --save express-session

FLASH É UMA ÁREA ESPECIAL DA SESSÃO USADA PARA ARMAZENAR MSGS.
### npm install connect-flash

VALIDAR FORMULÁRIO.
### npm install --save yup

INSTALAR O MÓDULO PASSPORT É UM MIDDLEWARE PARA A IMPLEMENTAÇÃO DE AUTENTICAÇÃO.
### npm install --save passport

INSTALAR A ESTRATÉGIA DE VALIDAÇÃO LOCAL.
### npm install --save passport-local

MÓDULO PARA ENVIAR E-MAIL
### npm install --save nodemailer@4.7.0
### npm install --save nodemailer

ACRESCENTAR NO BD O RELACIONAMENTO DA CHAVE PRIMARY COM CHAVE ESTRANGEIRA
### ALTER TABLE bruna.users ADD foreign key (situationId) 
### references bruna.situations(id) 
### ON DELETE RESTRICT ON UPDATE RESTRICT;

MULTER É UM MIDDLEWARE NODE.JS PARA MANIPULAÇÃO MULTIPART/FORM-DATA, USADO PARA O UPLOAD DE ARQUIVOS.
### npm install --save multer