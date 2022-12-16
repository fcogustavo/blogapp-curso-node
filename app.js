// Modules
    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodyParser = require('body-parser');
    const app = express();
    const admin = require('./routes/admin');
    const user = require('./routes/user');
    const path = require('path');
    const mongoose = require('mongoose');
    const db = require('./config/db');
    const session = require('express-session');
    const flash = require('connect-flash');
    const Post = require('./models/Post');
    const Category = require('./models/Category');
    const passport = require('passport');
    require('./config/auth')(passport);

// Configurations
    // Session
        app.use(session({
            secret: '',
            resave: true,
            saveUninitialized: true    
        }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(flash());
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg');
            res.locals.error_msg = req.flash('error_msg');
            res.locals.error_list = req.flash('error_list');
            res.locals.error = req.flash('error');
            res.locals.user = req.user || null;
            res.locals.navAdmin = req.user && req.user.eAdmin === 1 ? true : null;
            next();
        });
    // Body-Parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
    // Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');
    // Mongoose
        mongoose.connect(db.mongoURI).then(() => {
            console.log('MongoDB conectado!');
        }).catch((err) => {
            console.log('Erro ao conectar-se ao MongoDB:', err);
        });
    // Public
        app.use(express.static(path.join(__dirname,'public')));

// Routes
    app.get('/', (req, res) => {
        Post.find().populate('category').lean().sort({date: 'desc'}).then((posts) => {
            res.render('index', {posts: posts});
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno.');
            res.redirect('/404');
        });
    });

    app.get('/404', (req, res) => {
        res.send('Erro 404!');
    });

    app.get('/posts/:slug', (req, res) => {
        Post.findOne({slug: req.params.slug}).lean().then((post) => {
            if (post) {
                res.render('posts/index', {post: post});
            } else {
                req.flash('error_msg', 'Essa postagem não existe!');
                res.redirect('/');
            };
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível buscar a postagem!');
            res.redirect('/');
        });
    });

    app.get('/categories', (req, res) => {
        Category.find().lean().then((categories) => {
            res.render('categories/index', {categories: categories});
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao listar as categorias.');
            res.redirect('/');
        });
    });

    app.get('/categories/:slug', (req, res) => {
        Category.findOne({slug: req.params.slug}).lean().then((category) => {
            if (category) {
                Post.find({category: category._id}).lean().then((posts) => {
                    res.render('categories/posts', {category: category, posts: posts});
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao listar as postagens.');
                    res.redirect('/');
                });
            } else {
                req.flash('error_msg', 'Essa categoria não existe!');
                res.redirect('/')
            };
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria.');
            res.redirect('/');
        });
    });

    app.use('/admin', admin);

    app.use('/users', user);
    
// Others
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('Servidor Rodando!');
    });
