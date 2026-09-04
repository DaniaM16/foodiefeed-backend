const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const routes = require('./routes');
const initdb = require('./initdb');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use('/', routes);
app.use('/init', initdb);

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Server started and listening on port ${PORT} ... `);
    }
});