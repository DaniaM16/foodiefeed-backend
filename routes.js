const client = require('./db');
const express = require('express');
const router = express.Router();
router.get('/reviews', async(req, res) => {
    const query = `SELECT * FROM reviews`;

    try {
    const result = await client.query(query);
    console.log(result);
    res.send(result.rows);
    } catch (err) {
     console.log(err.stack);
     }
})

// eine GET-Anfrage
router.get('/', async(req, res) => {

    res.send({ message: "Hello FIW!" });
});

module.exports = router;