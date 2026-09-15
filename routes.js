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

// get review mit id
router.get('/reviews/:id', async(req,res) => {
    const query = `SELECT * FROM reviews WHERE id = $1`;

    try {
        const id = req.params.id;
        const result = await client.query(query, [id])
        console.log(result)
        
        if (result.rowCount == 1)
            res.send(result.rows[0]);
        else
            res.send({ message: "No review found with id=" + id });
        } catch (err) {
            console.log("error", err.stack)
        }
});


// eine GET-Anfrage
router.get('/', async(req, res) => {

    res.send({ message: "Hello FIW!" });
});

module.exports = router;