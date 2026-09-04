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
});



router.get('/users/:id/reviews', async(req, res) => {

    const userId = req.params.id;

    const query = `
SELECT reviews.*
FROM reviews
WHERE user_id = $1
`;


try {
const result = await client.query(query,[userId]);
res.send(result.rows);
} catch (err) {
 console.log(err.stack);
 }
});



// eine GET-Anfrage
router.get('/', async(req, res) => {

    res.send({ message: "Hello FIW!" });
});

module.exports = router;