// NORMATIZAR O CÓDIGO, AJUDA EVITAR GAMBIARRAS.
'use strict';

// PERMITE TRABALHAR COM O SISTEMA DE ARQUIVOS DO COMPUTADOR.
const fs = require('fs');
// FORNECE UTILITÁRIOS PARA TRABALHAR COM CAMINHOS DE ARQUIVOS E DIRETÓRIOS.
const path = require('path');
// SEQUELIZE É UM ORM PARA NODE.JS, QUE TEM SUPORTE VÁRIOS BANCOS DE DADOS
// ORM MAPEAMENTO OBJETO-RELACIONAL, AS TABELAS DO BANCO DE DADOS SÃO REPRESENTADAS
// EM CLASSES E OS REGISTROS DAS TABELAS SERIAM INSTÂNCIAS DESSAS CLASSES.
const Sequelize = require('sequelize');
// PERMITIR OBTER INFORMAÇÕES DO PROCESSO NA PÁGINA ATUAL.
const process = require('process');
// PERMITE OBTER PARTE DO CAMINHO PARA O ARQUIVO.
const basename = path.basename(__filename);
// VERIFICAR SE DEVE UTILIZAR A VARIÁVEL GLOBAL OU 'DEVELOPMENT'.
const env = process.env.NODE_ENV || 'development';
// INCLUIR O ARQUIVO
const config = require(__dirname + '/../config/database.js')[env];
// CRIAR A CONSTANTE COM OBJETO VAZIO.
const db = {};
// CRIAR A VARIÁVEL QUE RECEBE A CONEXÃO COM BD.
let sequelize;
// VERIFICAR QUAL CONFIGURAÇÃO DE BD VOCÊ DESEJA USAR.
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
// USAR AS CONFIG DO ARQUIVO "config/database.json"
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// VERIFICAR A CONEXÃO COM BD
try {
  console.log('Conexão com o banco de dados realizado com sucesso!')
} catch (error) {
  console.error('Erro: Conexão com o banco de dados não realizado com sucesso!', error);
}
// Identificar o MODEL

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ATRIBUIR A CONEXÃO COM BD PARA O OBJETO DB
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// EXPORTAR A INSTRUÇÃO QUE ESTÁ DENTRO DA CONSTANTE USER
module.exports = db;
