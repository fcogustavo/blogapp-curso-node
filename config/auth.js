const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new localStrategy({usernameField: 'email'}, (email, password, done) => {
        User.findOne({email: email}).then((user) => {
            if (!user) {
                return done(null, false, {message: 'Este usuário não existe!'})
            };
            bcrypt.compare(password, user.password, (err, resp) => {
                if (resp) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Senha incorreta!'})
                };
            });
        }).catch((err) => {
            return done('Houve um erro interno!'); //"done(err)" (pattern)
        });
    }));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};