const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const passport = require('passport')

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', (req, res) => {
    let erros = [];
    if (!req.body.name) {
        erros.push({text: 'Nome inválido!'});
    };
    if (!req.body.email) {
        erros.push({text: 'E-mail inválido!'});
    };
    if (!req.body.password) {
        erros.push({text: 'Senha inválida!'});
    };
    if (req.body.password.length < 4) {
        erros.push({text: 'Senha muito curta! Crie uma senha com no mínimo 4 caracteres.'})
    };
    if (req.body.password != req.body.password2) {
        erros.push({text: 'As senhas precisam ser iguais! Tente novamente.'})
    };
    if (erros.length > 0) {
        req.flash('error_list', erros);
        res.redirect('/users/register'); 
    } else {
        User.findOne({email: req.body.email}).then((user) => {
            if (user) {
                req.flash('error_msg', 'Já existe uma conta com esse e-mail no sistema!');
                res.redirect('/users/register');
            } else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) {
                            req.flash('error_msg', 'Houve um erro durante o processo de salvamento do cadastro de usuário.');
                            res.redirect('/');
                        } else {
                            newUser.password = hash;
                            newUser.save().then(() => {
                                req.flash('success_msg', 'Usuário cadastrado com sucesso!');
                                res.redirect('/');
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve um erro ao tentar salvar o cadastro de usuário. Tente novamente.');
                                res.redirect('/');
                            });
                        };
                    });
                });
            };
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno.');
            res.redirect('/');
        });
    };
});

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        };
        req.flash('success_msg', 'Usuário deslogado com sucesso!');
        res.redirect('/');
    });
});

module.exports = router;