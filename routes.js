const client = require('./db');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).send({ message: 'Kein Token vorhanden'});
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send({ message: 'Token ungültig' });
    }
}


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



router.get('/users/:id/reviews',checkToken, async(req, res) => {

    const userId = req.user.id;
    
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

router.post('/register', async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const checkQuery = `SELECT * FROM users WHERE email = $1`;
    const checkResult = await client.query(checkQuery, [email]);

    if(checkResult.rowCount > 0) {
        return res.status(400).send({ message: "E-Mail bereits registriert" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
INSERT INTO users (email, password)
VALUES ($1, $2)
RETURNING *
`;

try {
const result = await client.query(query, [email, hashedPassword]);
res.send(result.rows[0]);
} catch (err) {
 console.log("error", err.stack);
 }
});


router.post('/reviews', checkToken, upload.single('image'), async(req,res) => {

    let user_id = req.user.id;
    let name = (req.body.name) ? req.body.name : null;
    let category = (req.body.category) ? req.body.category : null;
    let district = (req.body.district) ? req.body.district : null;
    let rating = (req.body.rating) ? req.body.rating : null;
    let comment = (req.body.comment) ? req.body.comment : null;
    let recommended = (req.body.recommended) ? req.body.recommended : null;
    let visit_date = (req.body.visit_date) ? req.body.visit_date : null;
    let image = req.file ? req.file.filename : null;

    const query = `
    INSERT INTO reviews 
    (user_id, name, category, district, rating, comment, recommended, visit_date, image)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
            visit_date,
            image
        ]);

        res.send(result.rows[0]);
    } catch (err) {
        console.log("error", err.stack);
    }


});

router.delete('/reviews/:id', checkToken,async(req,res) => {
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

router.put('/reviews/:id', checkToken, upload.single('image'), async(req, res) => {
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
    let image = req.file ? req.file.filename: review.image;
    

    const updateQuery = `
    UPDATE reviews 
    SET name=$1, category=$2, district=$3, rating=$4,
    comment=$5, recommended=$6, visit_date=$7, image=$8
    WHERE id=$9
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
        image,
        id
    ]);
    res.send(updateResult.rows[0]);
    }

    else
    {
        res.send({ message: "No review found with id=" + id });
    }
})
router.post('/login', async(req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    const query = `SELECT * FROM users WHERE email=$1`;

    try {
        const result = await client.query(query, [email]);
        if (result.rowCount == 1) {
            const user = result.rows[0];
            const passwordCorrect = await bcrypt.compare(
                password, 
                user.password
            );
            
            if (passwordCorrect) {
                const token = jwt.sign( 
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET
                );

                res.send({
                    token: token,
                    user: {
                        id: user.id,
                        email: user.email
                    }
                });
                

             } else{
                res.status(401);
                res.send({ message: "Login fehlgeschlagen. E-Mail oder Passwort falsch." });
             }
    } else {
        res.status(401);
        res.send({ message: "Login fehlgeschlagen. E-Mail oder Passwort falsch."});
    }
  
  
    } catch (err) {
        console.log("error", err.stack);
    }
});

// eine GET-Anfrage
router.get('/', async(req, res) => {

    res.send({ message: "Hello FIW!" });
});





module.exports = router;