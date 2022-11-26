const express = require('express');
const Category = require('../models/Category');
const Post = require('../models/Post')
const router = express.Router();
const {eAdmin} = require('../helpers/eAdmin');

router.get('/', eAdmin, (req, res) => {
    res.render('admin/index');
});

router.get('/categories', eAdmin, (req, res) => {
    Category.find().lean().sort({date: 'desc'}).then((categories) => {
        res.render('admin/categories', {categories: categories});
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar as categorias.');
        res.redirect('/admin');
    });    
});

router.get('/categories/add', eAdmin, (req, res) => {
    res.render('admin/addcategory');
});

router.post('/categories/new', eAdmin, (req, res) => {
    let erros = [];
    if (!req.body.name || req.body.name.length < 2) {
        erros.push({text: "nome inválido ou muito curto!"});
    };
    if (!req.body.slug) {
        erros.push({text: "slug inválido!"});
    };
    if (erros.length > 0) {
        req.flash('error_list', erros);
        res.redirect('/admin/categories/add');
    } else {
        new Category({
            name: req.body.name,
            slug: req.body.slug
        }).save().then(() => {
            req.flash('success_msg', 'Categoria salva com sucesso!');
            res.redirect('/admin/categories');
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao salvar a categoria. Tente novamente.');
            res.redirect('/admin/categories');
        });
    };
});

router.get('/categories/edit/:id', eAdmin, (req, res) => {
    Category.findOne({_id: req.params.id}).lean().then((category) => {
        res.render('admin/editcategory', {category: category});
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível acessar essa categoria.');
        res.redirect('/admin/categories')
    });   
});

router.post('/categories/edit', eAdmin, (req, res) => {
    let erros = [];
    if (!req.body.name || req.body.name.length < 2) {
        erros.push({text: "nome inválido ou muito curto!"});
    };
    if (!req.body.slug) {
        erros.push({text: "slug inválido!"});
    };
    if (erros.length > 0) {
        req.flash('error_list', erros);
        res.redirect(`/admin/categories/edit/${req.body.id}`);
    } else {
        Category.findOne({_id: req.body.id}).then((category) => {
            category.name = req.body.name;
            category.slug = req.body.slug;
            category.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso!');
                res.redirect('/admin/categories');
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível salvar a edição da categoria. Tente novamente.');
                res.redirect('/admin/categories');
            });
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível editar a categoria. Tente novamente.');
            res.redirect('/admin/categories');
        });
    };    
});

router.post('/categories/delete', eAdmin, (req, res) => {
    Category.deleteOne({_id: req.body.id}).then((obj) => {
        req.flash('success_msg', 'Categoria deletada com sucesso!');
        res.redirect('/admin/categories');
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível deletar a categoria. Tente novamente.');
        res.redirect('/admin/categories');
    });
});

router.get('/posts', eAdmin, (req, res) => {
    Post.find().populate('category').lean().sort({date: 'desc'}).then((posts) => {
        res.render('admin/posts', {posts: posts});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens.');
        res.redirect('/admin')
    });
    
});

router.get('/posts/add', eAdmin, (req, res) => {
    Category.find().lean().then((categories) => {
        res.render('admin/addpost', {categories: categories});
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar a página.');
        res.redirect('/admin');
    });    
});

function validErrorPost(req) {
    let erros = [];
    if (!req.body.title || req.body.title.length < 2) {
        erros.push({text: 'nome inválido ou muito curto!'});
    };
    if (!req.body.slug) {
        erros.push({text: 'slug inválido!'});
    };
    if (!req.body.description) {
        erros.push({text: 'Descrição inválida!'});
    };
    if (!req.body.content) {
        erros.push({text: 'Contéudo inválido!'});
    };
    if (req.body.category == '0') {
        erros.push({text: 'Categoria inválida! Selecione ou registre uma categoria!'});
    };
    return erros;
};

router.post('/posts/new', eAdmin, (req, res) => {
    let erros = validErrorPost(req);
    if (erros.length > 0) {
        req.flash('error_list', erros);
        res.redirect('/admin/posts/add');
    } else {
        new Post({
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            content: req.body.content,
            category: req.body.category
        }).save().then(() => {
            req.flash('success_msg', 'Postagem salva com sucesso!');
            res.redirect('/admin/posts');
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao salvar a postagem. Tente novamente.');
            res.redirect('/admin/posts');
        });
    };    
});

router.get('/posts/edit/:id', eAdmin, (req, res) => {
    Post.findOne({_id: req.params.id}).lean().then((post) => {
        Category.find().lean().then((categories) => {
            for (c of categories) {
                if (`${post.category}` === `${c._id}`) {
                    c.select = 'selected';
                } else {
                    c.select = '';
                };
            };
            res.render('admin/editpost', {post: post, categories: categories});
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias de postagens.');
            res.redirect('admin/posts');
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição.');
        res.redirect('/admin/posts');
    });
});

router.post('/posts/edit', eAdmin, (req, res) => {
    let erros = validErrorPost(req);
    if (erros.length > 0) {
        req.flash('error_list', erros);
        res.redirect(`/admin/posts/edit/${req.body.id}`);
    } else {
        Post.findOne({_id: req.body.id}).then((post) => {
            post.title = req.body.title;
            post.slug = req.body.slug;
            post.description = req.body.description;
            post.content = req.body.content;
            post.category = req.body.category;
            post.save().then(() => {
                req.flash('success_msg', 'Postagem editada com sucesso!');
                res.redirect('/admin/posts');
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao salvar a edição da postagem. Tente novamente.');
                res.redirect('/admin/posts');
            });
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao tentar editar a postagem. Tente novamente.')
        });
    };
});

router.get('/posts/delete/:id', eAdmin, (req, res) => {
    Post.deleteOne({_id: req.params.id}).then((obj) => {
        req.flash('success_msg', 'Postagem deletada com sucesso!')
        res.redirect('/admin/posts');
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível deletar a postagem.');
        res.redirect('/admin/posts');
    });
});

module.exports = router;