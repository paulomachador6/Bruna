// MULTER É UM MIDDLEWARE NODE.JS PARA MANIPULAÇÃO MULTIPART/FORM-DATA, USADO PARA 
// O UPLOAD DE ARQUIVOS.
const multer = require('multer');

// O MÓDULO PATH PERMITE INTERAGIR COM O SISTEMA DE ARQUIVOS
const path = require('path');

// REALIZAR UPLOAD DO USUÁRIO
module.exports = (multer({
// DiskStorage permite manipular local para salvar a imagem
storage: multer.diskStorage({
  // LOCAL PARA SALVAR A IMAGEM
  destination: (req, file, cb) => {
    cb(null, './public/images/news')
  },
  filename: (req, file, cb) => {
    // console.log(Date.now().toString() + req.user.dataValues.id + path.extname(file.originalname));
    cb(null, Date.now().toString() + req.user.dataValues.id + path.extname(file.originalname));
  }
}),
// VALIDAR A EXTENSÃO DO ARQUIVO
fileFilter: (req, file, cb) => {
  // VERIFICAR SE A EXTENSÃO DA IMAGEM ENVIADA PELO USUÁRIO ESTÁ NO ARRAY DE EXTENSÕES.
  const extensaoImg = ['image/jpeg', 'image/jpg', 'image/png'].find(formatoAceito => formatoAceito == file.mimetype);
  if (extensaoImg) {
    return cb(null, true);
  }
  return cb(null, false);
}
}));