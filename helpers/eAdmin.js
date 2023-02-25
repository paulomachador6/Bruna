// Validar se o usuário está logado
module.exports = {
  eAdmin: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("danger_msg", "Erro: Necessário realizar o login para acessar a página solicitada!");
      res.redirect('/login');
    }
  }
}