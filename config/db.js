if (process.env.NODE_ENV == 'production') {
    module.exports = {mongoURI: 'mongodb+srv://<username>:<password>@db.fmu4d.mongodb.net/db'};
} else {
    module.exports = {mongoURI: 'mongodb://localhost/db'};
};