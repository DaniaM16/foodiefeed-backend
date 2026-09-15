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

router.post('/reviews',async(req,res) => {
    let user_id = (req.body.user_id) ? req.body.user_id : null;
    let name = (req.body.name) ? req.body.name : null;
    let category = (req.body.category) ? req.body.category : null;
    let district = (req.body.district) ? req.body.district : null;
    let rating = (req.body.rating) ? req.body.rating : null;
    let comment = (req.body.comment) ? req.body.comment : null;
    let recommended = (req.body.recommended) ? req.body.recommended : null;
    let visit_date = (req.body.visit_date) ? req.body.visit_date : null;

    const query = `
    INSERT INTO reviews 
    (user_id, name, category, district, rating, comment, recommended, visit_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
    `;
    
    try {
        const result = await client.query(query, [
            user_id,
            name,
            category,
            district,
            rating,
            comment,
            recommended,
            visit_date
        ]);

        res.send(result.rows[0]);
    } catch (err) {
        console.log("error", err.stack);
    }


});

router.delete('/reviews/:id', async(req,res) => {
    const query = `DELETE FROM reviews WHERE id=$1`;
    const id = req.params.id;
    try {
        const result = await client.query(query, [id]);
        console.log(result);

        if (result.rowCount == 1)
            res.send({ message: "Review deleted with id=" + id });
        else
            res.send({ message: "No review found with id=" + id});
        } catch (err) {
            console.log("error", err.stack);
        }

});

router.put('/reviews/:id', async(req, res) => {
    const query = `SELECT * FROM reviews WHERE id=$1`;

    let id = req.params.id;
    const result = await client.query(query, [id]);

    if(result.rowCount > 0)
    {
        let review = result.rows[0];

    let name = (req.body.name) ? req.body.name : review.name;
    let category = (req.body.category) ? req.body.category : review.category;
    let district = (req.body.district) ? req.body.district : review.district;
    let rating = (req.body.rating) ? req.body.rating : review.rating;
    let comment = (req.body.comment) ? req.body.comment : review.comment;
    let recommended = (req.body.recommended) ? req.body.recommended : review.recommended;
    let visit_date = (req.body.visit_date) ? req.body.visit_date : review.visit_date;
    

    const updateQuery = `
    UPDATE reviews 
    SET name=$1, category=$2, district=$3, rating=$4,
    comment=$5, recommended=$6, visit_date=$7
    WHERE id=$8
    RETURNING *
    `

    const updateResult = await client.query(updateQuery, [
        name,
        category,
        district,
        rating,
        comment,
        recommended,
        visit_date,
        id
    ]);
    res.send(updateResult.rows[0]);
    }

    else
    {
        res.send({ message: "No review found with id=" + id });
    }
})


// eine GET-Anfrage
router.get('/', async(req, res) => {

    res.send({ message: "Hello FIW!" });
});

module.exports = router;