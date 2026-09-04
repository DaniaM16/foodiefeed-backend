const express = require('express');
const client = require('./db');
const initdb = express.Router();
const format = require('pg-format');

initdb.get('/', async(req, res) => {

    let query = `

    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );
    CREATE TABLE reviews(
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        district VARCHAR (50),
        rating INTEGER,
        comment TEXT,
        recommended BOOLEAN,
        visit_date DATE
    );
`;
    try {
        await client.query(query);
        console.log("Tables created successfully ...");
    } catch (err) {
        console.log(err);
    }
    const userValues = [
        ["test@foodiefeed.de", "testpasswort"]
        ];

    const userQuery = format(
    'INSERT INTO users(email, password) VALUES %L RETURNING *', 
    userValues
    );
    try {
        const result = await client.query(userQuery);
        console.log("User inserted successfully ...");
        console.log(result.rows);
    } catch (err) {
        console.log(err);
    }
    const reviewValues = [
    [1, "Cafe Beispiel", "Cafe", "Kreuzberg", 5, "Sehr lecker!", true, "2026-09-04"]
    ];
    
    const reviewQuery = format(
    'INSERT INTO reviews(user_id, name, category, district, rating, comment, recommended, visit_date) VALUES %L RETURNING *',
    reviewValues
    );

    try {
    const result = await client.query(reviewQuery);
    console.log("Review inserted successfully ...");
    console.log(result.rows);
    res.status(200);
    res.send(result.rows);
    } catch (err) {
     console.log(err);
     }

});module.exports = initdb;


