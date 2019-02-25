const fs = require('fs');
const express = require('express');
const uuidv4 = require('uuid/v4');
var pgp = require('pg-promise')();
const cors = require('cors');
const multiparty = require('multiparty');
const request = require('request');

const app = express();

const db_user = process.env.DB_USER || 'postgres';
const db_pass = process.env.DB_PASS || 'Tre13ieme';
const db_host = process.env.DB_HOST || '127.0.0.1';
const db_port = process.env.DB_PORT || 5432;
const db_name = process.env.DB || 'books_api';
const port = process.env.APP_PORT || 3000;
const files_api = process.env.FILES_API;
const pdf_api = process.env.PDF_API;

const db = pgp(`postgres://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}`)

app.use(cors());

//db.none('DROP TABLE IF EXISTS books');
//db.none('CREATE TABLE IF NOT EXISTS books (uuid VARCHAR(60), book_name VARCHAR(255), author_name VARCHAR(255), file VARCHAR(255), image VARCHAR(255))');


app.get('/books/', (req, res) => {
    db.query('SELECT * FROM books ORDER BY uuid DESC').then((data) => {
        res.json(data);
    });
});

app.post('/books/', async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        const image =  await sendFileRequest(files.file[0].path, pdf_api);
        const file =  await sendFileRequest(files.file[0].path, files_api);
        const dataset = {
            uuid: uuidv4(),
            book_name: fields.book_name[0],
            author_name: fields.author_name[0],
            file: file.filename,
            image: image.filename
        };
        db.none('INSERT INTO books VALUES ($1, $2, $3, $4, $5)', Object.values(dataset));
        res.json(dataset);
    });
});

const sendFileRequest = (filepath, api) => {
    return new Promise((resolve) => {
        request.post({
            url:api,
            formData: {file: fs.createReadStream(filepath)}
        }, (err, httpResponse, body) => {
            resolve(JSON.parse(body));
        });
    });
}

app.listen(port, () => console.log(`Books API listening on port ${port}!`))