module.exports = {
    eAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.eAdmin == 1) {
            return next();
        };
        req.flash('error_msg', 'Você deve estar logado como administrador para entrar nessa página!');
        res.redirect('/');
    }
};